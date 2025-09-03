package redis

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/rikut0904/bloomia/backend/internal/domain/repositories"
)

type redisRepository struct {
	client *redis.Client
}

func NewRedisRepository(client *redis.Client) repositories.RedisRepository {
	return &redisRepository{client: client}
}

func (r *redisRepository) Set(ctx context.Context, key string, value interface{}, expiration int) error {
	var data []byte
	var err error

	switch v := value.(type) {
	case string:
		data = []byte(v)
	default:
		data, err = json.Marshal(value)
		if err != nil {
			return err
		}
	}

	duration := time.Duration(expiration) * time.Second
	return r.client.Set(ctx, key, data, duration).Err()
}

func (r *redisRepository) Get(ctx context.Context, key string) (string, error) {
	return r.client.Get(ctx, key).Result()
}

func (r *redisRepository) Delete(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}