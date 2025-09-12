package http

import (
	"net/http"

	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
)

// BaseHandler 共通ハンドラー機能を提供する構造体
type BaseHandler struct {
	config *config.Config
}

// NewBaseHandler ベースハンドラーのコンストラクタ
func NewBaseHandler(cfg *config.Config) *BaseHandler {
	return &BaseHandler{
		config: cfg,
	}
}

// HandleWithAuth 認証付きリクエストハンドラー
func (b *BaseHandler) HandleWithAuth(
	w http.ResponseWriter, 
	r *http.Request, 
	method string, 
	handler func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error,
) {
	// メソッドバリデーション
	if !validateMethod(w, r, method) {
		return
	}

	// 認証コンテキストを取得
	authCtx := getAuthContext(b.config)

	// ハンドラー実行
	if err := handler(w, r, authCtx); err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// HandleWithValidation バリデーション付きリクエストハンドラー
func (b *BaseHandler) HandleWithValidation(
	w http.ResponseWriter, 
	r *http.Request, 
	method string, 
	validateFn func(w http.ResponseWriter, r *http.Request) bool,
	handler func(w http.ResponseWriter, r *http.Request, authCtx AuthContext) error,
) {
	// メソッドバリデーション
	if !validateMethod(w, r, method) {
		return
	}

	// カスタムバリデーション
	if !validateFn(w, r) {
		return
	}

	// 認証コンテキストを取得
	authCtx := getAuthContext(b.config)

	// ハンドラー実行
	if err := handler(w, r, authCtx); err != nil {
		writeErrorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// ParseJSONAndValidate JSONパースとバリデーションを一括実行
func (b *BaseHandler) ParseJSONAndValidate(
	w http.ResponseWriter, 
	r *http.Request, 
	dest interface{}, 
	validateFn func(w http.ResponseWriter, data interface{}) bool,
) bool {
	// JSONパース
	if !parseJSONRequest(w, r, dest) {
		return false
	}

	// バリデーション
	if validateFn != nil && !validateFn(w, dest) {
		return false
	}

	return true
}

// SendSuccessResponse 成功レスポンスを送信
func (b *BaseHandler) SendSuccessResponse(w http.ResponseWriter, message string, data interface{}) {
	writeSuccessResponse(w, message, data)
}

// SendJSONResponse JSONレスポンスを送信
func (b *BaseHandler) SendJSONResponse(w http.ResponseWriter, data interface{}, status int) {
	writeJSONResponse(w, data, status)
}

// SendErrorResponse エラーレスポンスを送信
func (b *BaseHandler) SendErrorResponse(w http.ResponseWriter, message string, status int) {
	writeErrorResponse(w, message, status)
}