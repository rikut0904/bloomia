package redis

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

var Client *redis.Client
var ctx = context.Background()

// InitRedis initializes the Redis connection
func InitRedis() error {
	// Railway Redis connection
	redisURL := os.Getenv("REDIS_URL")
	
	var rdb *redis.Client
	
	if redisURL != "" {
		// Parse Redis URL
		opts, err := redis.ParseURL(redisURL)
		if err != nil {
			return fmt.Errorf("failed to parse Redis URL: %w", err)
		}
		rdb = redis.NewClient(opts)
	} else {
		// Fallback to individual environment variables
		host := os.Getenv("REDIS_HOST")
		port := os.Getenv("REDIS_PORT")
		password := os.Getenv("REDIS_PASSWORD")
		dbStr := os.Getenv("REDIS_DB")
		
		if host == "" {
			host = "localhost"
		}
		if port == "" {
			port = "6379"
		}
		
		db := 0
		if dbStr != "" {
			var err error
			db, err = strconv.Atoi(dbStr)
			if err != nil {
				log.Printf("Invalid REDIS_DB value, using default: %v", err)
				db = 0
			}
		}

		rdb = redis.NewClient(&redis.Options{
			Addr:     fmt.Sprintf("%s:%s", host, port),
			Password: password,
			DB:       db,
		})
	}

	// Test the connection
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to ping Redis: %w", err)
	}

	Client = rdb
	log.Println("Successfully connected to Redis")
	return nil
}

// CloseRedis closes the Redis connection
func CloseRedis() {
	if Client != nil {
		Client.Close()
		log.Println("Redis connection closed")
	}
}

// HealthCheck checks if Redis is reachable
func HealthCheck() error {
	if Client == nil {
		return fmt.Errorf("redis client is nil")
	}
	
	_, err := Client.Ping(ctx).Result()
	return err
}

// Set stores a key-value pair with expiration
func Set(key string, value interface{}, expiration time.Duration) error {
	if Client == nil {
		return fmt.Errorf("redis client is nil")
	}
	return Client.Set(ctx, key, value, expiration).Err()
}

// Get retrieves a value by key
func Get(key string) (string, error) {
	if Client == nil {
		return "", fmt.Errorf("redis client is nil")
	}
	return Client.Get(ctx, key).Result()
}

// Del deletes a key
func Del(key string) error {
	if Client == nil {
		return fmt.Errorf("redis client is nil")
	}
	return Client.Del(ctx, key).Err()
}