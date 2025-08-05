package authenticator

import (
	"context"
	"fmt"
	"os"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

type Authenticator struct {
	Provider *oidc.Provider
	Config   oauth2.Config
	Verifier *oidc.IDTokenVerifier
}

type Auth0Config struct {
	Domain       string
	ClientID     string
	ClientSecret string
	CallbackURL  string
	LogoutURL    string
}

func NewAuthenticator() (*Authenticator, error) {
	domain := os.Getenv("AUTH0_DOMAIN")
	clientID := os.Getenv("AUTH0_CLIENT_ID")
	clientSecret := os.Getenv("AUTH0_CLIENT_SECRET")
	callbackURL := os.Getenv("AUTH0_CALLBACK_URL")

	provider, err := oidc.NewProvider(context.Background(), "https://"+domain+"/")
	if err != nil {
		return nil, fmt.Errorf("failed to get provider: %v", err)
	}

	config := oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  callbackURL,
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}

	verifier := provider.Verifier(&oidc.Config{ClientID: clientID})

	return &Authenticator{
		Provider: provider,
		Config:   config,
		Verifier: verifier,
	}, nil
}

func (a *Authenticator) AuthCodeURL(state string) string {
	return a.Config.AuthCodeURL(state)
}

func (a *Authenticator) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	return a.Config.Exchange(ctx, code)
}

func (a *Authenticator) VerifyIDToken(ctx context.Context, tokenString string) (*oidc.IDToken, error) {
	return a.Verifier.Verify(ctx, tokenString)
}

func (a *Authenticator) GetUserInfo(ctx context.Context, token *oauth2.Token) (*oidc.UserInfo, error) {
	return a.Provider.UserInfo(ctx, oauth2.StaticTokenSource(token))
}

type UserProfile struct {
	Sub        string `json:"sub"`
	Email      string `json:"email"`
	Name       string `json:"name"`
	Picture    string `json:"picture"`
	UpdatedAt  string `json:"updated_at"`
	EmailVerified bool `json:"email_verified"`
}

func (a *Authenticator) GetUserProfile(ctx context.Context, token *oauth2.Token) (*UserProfile, error) {
	userInfo, err := a.GetUserInfo(ctx, token)
	if err != nil {
		return nil, err
	}

	var profile UserProfile
	if err := userInfo.Claims(&profile); err != nil {
		return nil, err
	}

	return &profile, nil
} 