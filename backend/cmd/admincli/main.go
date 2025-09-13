package main

import (
    "crypto/rand"
    "database/sql"
    "encoding/hex"
    "flag"
    "fmt"
    "log"
    "strings"
    "time"

    "github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
    dbpkg "github.com/rikut0904/bloomia/backend/internal/infrastructure/database"
)

func main() {
    name := flag.String("name", "", "Admin user's name (required)")
    email := flag.String("email", "", "Admin user's email (required)")
    schoolID := flag.Int64("school-id", 0, "Target school id (optional)")
    schoolCode := flag.String("school-code", "", "Target school code (optional)")
    firebaseUID := flag.String("firebase-uid", "", "Firebase UID (optional; auto-generated if empty)")
    approve := flag.Bool("approve", true, "Mark admin as approved and active")
    flag.Parse()

    if strings.TrimSpace(*name) == "" || strings.TrimSpace(*email) == "" {
        log.Fatal("--name and --email are required")
    }

    cfg := config.Load()
    db, err := dbpkg.Connect(cfg.DatabaseURL)
    if err != nil {
        log.Fatalf("DB connect error: %v", err)
    }
    defer db.Close()

    sid, err := resolveOrCreateSchool(db, *schoolID, *schoolCode)
    if err != nil {
        log.Fatalf("resolve school error: %v", err)
    }

    uid := *firebaseUID
    if uid == "" {
        uid = genUID()
    }

    userID, err := upsertAdmin(db, uid, *name, *email, sid, *approve)
    if err != nil {
        log.Fatalf("create admin error: %v", err)
    }

    fmt.Printf("Admin ensured:\n  id=%s\n  email=%s\n  name=%s\n  firebase_uid=%s\n  school_id=%d\n", userID, *email, *name, uid, sid)
}

func genUID() string {
    b := make([]byte, 12)
    if _, err := rand.Read(b); err != nil {
        return fmt.Sprintf("admin_%d", time.Now().UnixNano())
    }
    return "admin_" + hex.EncodeToString(b)
}

func resolveOrCreateSchool(db *sql.DB, id int64, code string) (int64, error) {
    if id > 0 {
        var exists bool
        if err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM schools WHERE id=$1)`, id).Scan(&exists); err != nil {
            return 0, err
        }
        if exists { return id, nil }
        return 0, fmt.Errorf("school not found: id=%d", id)
    }
    if code != "" {
        var sid int64
        err := db.QueryRow(`SELECT id FROM schools WHERE code=$1`, code).Scan(&sid)
        if err == nil { return sid, nil }
        if err != sql.ErrNoRows { return 0, err }
        // create with given code
        return createSchool(db, "System Administration", code)
    }
    // Try to find or create default code 'system'
    var sid int64
    err := db.QueryRow(`SELECT id FROM schools WHERE code='system'`).Scan(&sid)
    if err == nil { return sid, nil }
    if err != sql.ErrNoRows { return 0, err }
    return createSchool(db, "System Administration", "system")
}

func createSchool(db *sql.DB, name, code string) (int64, error) {
    var sid int64
    err := db.QueryRow(`
        INSERT INTO schools (name, code, is_active, created_at, updated_at)
        VALUES ($1, $2, true, NOW(), NOW())
        RETURNING id
    `, name, code).Scan(&sid)
    if err != nil { return 0, err }
    return sid, nil
}

func upsertAdmin(db *sql.DB, firebaseUID, name, email string, schoolID int64, approve bool) (string, error) {
    // If user exists by email or firebase_uid, update to admin
    var id string
    err := db.QueryRow(`
        SELECT id::text FROM users WHERE email=$1 OR firebase_uid=$2 LIMIT 1
    `, email, firebaseUID).Scan(&id)
    if err != nil && err != sql.ErrNoRows { return "", err }

    if id == "" {
        // insert
        err = db.QueryRow(`
            INSERT INTO users (firebase_uid, name, email, role, school_id, is_active, is_approved, created_at, updated_at)
            VALUES ($1, $2, $3, 'admin', $4, $5, $6, NOW(), NOW())
            RETURNING id::text
        `, firebaseUID, name, email, schoolID, approve, approve).Scan(&id)
        if err != nil { return "", err }
        return id, nil
    }

    // update
    _, err = db.Exec(`
        UPDATE users SET name=$2, email=$3, role='admin', school_id=$4, is_active=$5, is_approved=$5, updated_at=NOW()
        WHERE id::text=$1
    `, id, name, email, schoolID, approve)
    if err != nil { return "", err }
    return id, nil
}

