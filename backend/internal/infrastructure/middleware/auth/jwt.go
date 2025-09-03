package auth

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
)

type JWTMiddleware struct {
	middleware *jwtmiddleware.JWTMiddleware
}

type contextKey string

const (
	UserContextKey contextKey = "user"
)

func NewJWTMiddleware(auth0Domain string) *JWTMiddleware {
	issuerURL := fmt.Sprintf("https://%s/", auth0Domain)
	
	// URLを解析してから渡す
	issuerURLParsed, err := url.Parse(issuerURL)
	if err != nil {
		panic(fmt.Sprintf("Invalid issuer URL: %v", err))
	}
	
	provider := jwks.NewCachingProvider(issuerURLParsed, 5*60) // 5分キャッシュ

	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		issuerURL,
		[]string{issuerURL + "api/v2/"}, // audience
		validator.WithCustomClaims(func() validator.CustomClaims {
			return &CustomClaims{}
		}),
		validator.WithAllowedClockSkew(30), // 30秒の時刻のずれを許容
	)
	if err != nil {
		panic(fmt.Sprintf("Failed to set up JWT validator: %v", err))
	}

	middleware := jwtmiddleware.New(
		jwtValidator.ValidateToken,
		jwtmiddleware.WithErrorHandler(func(w http.ResponseWriter, r *http.Request, err error) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error":"Unauthorized","message":"` + err.Error() + `"}`))
		}),
		jwtmiddleware.WithTokenExtractor(func(r *http.Request) (string, error) {
			// Authorizationヘッダーからトークンを抽出
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				return "", fmt.Errorf("authorization header is required")
			}

			if !strings.HasPrefix(authHeader, "Bearer ") {
				return "", fmt.Errorf("authorization header must start with Bearer")
			}

			return strings.TrimPrefix(authHeader, "Bearer "), nil
		}),
	)

	return &JWTMiddleware{
		middleware: middleware,
	}
}

type CustomClaims struct {
	Sub   string `json:"sub"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func (c CustomClaims) Validate(ctx context.Context) error {
	return nil
}

func (j *JWTMiddleware) Middleware(next http.Handler) http.Handler {
	return j.middleware.CheckJWT(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// JWTから取得したクレームをコンテキストに追加
		token := r.Context().Value(jwtmiddleware.ContextKey{})
		if validatedClaims, ok := token.(*validator.ValidatedClaims); ok {
			if customClaims, ok := validatedClaims.CustomClaims.(*CustomClaims); ok {
				ctx := context.WithValue(r.Context(), UserContextKey, customClaims)
				r = r.WithContext(ctx)
			}
		}
		
		next.ServeHTTP(w, r)
	}))
}

func GetUserFromContext(ctx context.Context) (*CustomClaims, bool) {
	user, ok := ctx.Value(UserContextKey).(*CustomClaims)
	return user, ok
}