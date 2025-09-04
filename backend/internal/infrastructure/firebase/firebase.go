package firebase

import (
	"context"
	"fmt"
	"os"

	"firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

type FirebaseClient struct {
	App  *firebase.App
	Auth *auth.Client
}

func NewFirebaseClient() (*FirebaseClient, error) {
	// Firebase設定を環境変数から取得
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	if projectID == "" {
		return nil, fmt.Errorf("FIREBASE_PROJECT_ID is not set")
	}

	config := &firebase.Config{
		ProjectID: projectID,
	}

	// サービスアカウントキーを環境変数から取得
	var opt option.ClientOption
	if serviceAccountKey := os.Getenv("FIREBASE_SERVICE_ACCOUNT_KEY"); serviceAccountKey != "" {
		// デモキーの場合はエラーを返す
		if serviceAccountKey == `{"type":"service_account","project_id":"bloomia-dev-2025","private_key_id":"demo","private_key":"-----BEGIN PRIVATE KEY-----\nDEMO_KEY\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-demo@bloomia-dev-2025.iam.gserviceaccount.com","client_id":"demo","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-demo%40bloomia-dev-2025.iam.gserviceaccount.com"}` {
			return nil, fmt.Errorf("Firebase service account key is not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY with actual service account key")
		}
		// JSON文字列として設定
		opt = option.WithCredentialsJSON([]byte(serviceAccountKey))
	} else if credentialsFile := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"); credentialsFile != "" {
		// デフォルトの認証情報を使用（GCP環境など）
		opt = option.WithCredentialsFile(credentialsFile)
	} else {
		return nil, fmt.Errorf("neither FIREBASE_SERVICE_ACCOUNT_KEY nor GOOGLE_APPLICATION_CREDENTIALS is set")
	}

	app, err := firebase.NewApp(context.Background(), config, opt)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase app: %w", err)
	}

	authClient, err := app.Auth(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase Auth: %w", err)
	}

	return &FirebaseClient{
		App:  app,
		Auth: authClient,
	}, nil
}

// VerifyIDToken Firebase IDトークンを検証
func (fc *FirebaseClient) VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error) {
	token, err := fc.Auth.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, fmt.Errorf("failed to verify ID token: %w", err)
	}
	return token, nil
}

// GetUser Firebase UIDからユーザー情報を取得
func (fc *FirebaseClient) GetUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	user, err := fc.Auth.GetUser(ctx, uid)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return user, nil
}

// CreateUser Firebaseでユーザーを作成
func (fc *FirebaseClient) CreateUser(ctx context.Context, email, password, displayName string) (*auth.UserRecord, error) {
	params := (&auth.UserToCreate{}).
		Email(email).
		Password(password).
		DisplayName(displayName).
		EmailVerified(false)

	user, err := fc.Auth.CreateUser(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}
	return user, nil
}

// UpdateUser Firebaseユーザー情報を更新
func (fc *FirebaseClient) UpdateUser(ctx context.Context, uid string, updates *auth.UserToUpdate) (*auth.UserRecord, error) {
	user, err := fc.Auth.UpdateUser(ctx, uid, updates)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}
	return user, nil
}

// DeleteUser Firebaseユーザーを削除
func (fc *FirebaseClient) DeleteUser(ctx context.Context, uid string) error {
	err := fc.Auth.DeleteUser(ctx, uid)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	return nil
}

// SetCustomUserClaims カスタムクレームを設定
func (fc *FirebaseClient) SetCustomUserClaims(ctx context.Context, uid string, claims map[string]interface{}) error {
	err := fc.Auth.SetCustomUserClaims(ctx, uid, claims)
	if err != nil {
		return fmt.Errorf("failed to set custom user claims: %w", err)
	}
	return nil
}

// GetCustomUserClaims カスタムクレームを取得
func (fc *FirebaseClient) GetCustomUserClaims(ctx context.Context, uid string) (map[string]interface{}, error) {
	user, err := fc.Auth.GetUser(ctx, uid)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return user.CustomClaims, nil
}