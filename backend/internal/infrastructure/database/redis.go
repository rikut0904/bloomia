package database

import (
	"context"
	"fmt"
	"net/url"
	"strconv"

	"github.com/redis/go-redis/v9"
)

func ConnectRedis(redisURL string) *redis.Client {
	if redisURL == "" {
		// デフォルト接続
		return redis.NewClient(&redis.Options{
			Addr: "localhost:6379",
		})
	}

	// URL解析
	u, err := url.Parse(redisURL)
	if err != nil {
		panic(fmt.Sprintf("Invalid Redis URL: %v", err))
	}

	// パスワードの取得
	password := ""
	if u.User != nil {
		password, _ = u.User.Password()
	}

	// データベース番号の取得
	db := 0
	if len(u.Path) > 1 {
		if dbNum, err := strconv.Atoi(u.Path[1:]); err == nil {
			db = dbNum
		}
	}

	client := redis.NewClient(&redis.Options{
		Addr:     u.Host,
		Password: password,
		DB:       db,
	})

	// 接続テスト
	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		panic(fmt.Sprintf("Failed to connect to Redis: %v", err))
	}

	return client
}