package school

import (
    "context"
    "database/sql"
    "fmt"

    "github.com/rikut0904/bloomia/backend/internal/domain/entities"
    "github.com/rikut0904/bloomia/backend/internal/domain/repositories"
)

type schoolRepository struct {
	db *sql.DB
}

func NewSchoolRepository(db *sql.DB) repositories.SchoolRepository {
	return &schoolRepository{db: db}
}

func (r *schoolRepository) CreateSchool(ctx context.Context, school *entities.School) (*entities.School, error) {
    // Map current entity fields to README schema: name <- SchoolName, code <- SchoolID
    query := `
        INSERT INTO schools (name, code, address, phone_number, principal_name, student_capacity)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, code, address, phone_number, principal_name, student_capacity, created_at, updated_at
    `

    var (
        id int64
        name string
        code string
        address sql.NullString
        phone sql.NullString
        principal sql.NullString
        capacity sql.NullInt64
        createdAt, updatedAt sql.NullTime
    )

    err := r.db.QueryRowContext(ctx, query,
        school.SchoolName,
        school.SchoolID,
        school.Address,
        school.Phone,
        nil,
        nil,
    ).Scan(&id, &name, &code, &address, &phone, &principal, &capacity, &createdAt, &updatedAt)

    if err != nil {
        return nil, fmt.Errorf("failed to create school: %w", err)
    }

    // Populate back minimal fields
    school.ID = fmt.Sprintf("%d", id)
    school.SchoolName = name
    school.SchoolID = code
    if createdAt.Valid {
        school.CreatedAt = createdAt.Time
    }
    if updatedAt.Valid {
        school.UpdatedAt = updatedAt.Time
    }

    return school, nil
}

func (r *schoolRepository) GetSchoolByID(ctx context.Context, schoolID int64) (*entities.School, error) {
    query := `
        SELECT id, name, code, address, phone_number, created_at, updated_at
        FROM schools WHERE id = $1
    `
    var s entities.School
    var id int64
    var address sql.NullString
    var phone sql.NullString
    err := r.db.QueryRowContext(ctx, query, schoolID).Scan(&id, &s.SchoolName, &s.SchoolID, &address, &phone, &s.CreatedAt, &s.UpdatedAt)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("school not found with id: %d", schoolID)
        }
        return nil, fmt.Errorf("failed to get school: %w", err)
    }
    s.ID = fmt.Sprintf("%d", id)
    if address.Valid { s.Address = &address.String }
    if phone.Valid { s.Phone = &phone.String }
    return &s, nil
}

func (r *schoolRepository) GetSchoolByCode(ctx context.Context, code string) (*entities.School, error) {
    query := `
        SELECT id, name, code, address, phone_number, created_at, updated_at
        FROM schools 
        WHERE code = $1
    `
    var s entities.School
    var id int64
    var address sql.NullString
    var phone sql.NullString
    err := r.db.QueryRowContext(ctx, query, code).Scan(&id, &s.SchoolName, &s.SchoolID, &address, &phone, &s.CreatedAt, &s.UpdatedAt)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("school not found with code: %s", code)
        }
        return nil, fmt.Errorf("failed to find school by code: %w", err)
    }
    s.ID = fmt.Sprintf("%d", id)
    if address.Valid { s.Address = &address.String }
    if phone.Valid { s.Phone = &phone.String }
    return &s, nil
}

func (r *schoolRepository) GetAllSchools(ctx context.Context, filters map[string]interface{}) ([]*entities.School, error) {
    query := `
        SELECT id, name, code, address, phone_number, created_at, updated_at
        FROM schools
        ORDER BY name
    `
    rows, err := r.db.QueryContext(ctx, query)
    if err != nil {
        return nil, fmt.Errorf("failed to get schools: %w", err)
    }
    defer rows.Close()

    var schools []*entities.School
    for rows.Next() {
        var school entities.School
        var id int64
        var address sql.NullString
        var phone sql.NullString
        err := rows.Scan(&id, &school.SchoolName, &school.SchoolID, &address, &phone, &school.CreatedAt, &school.UpdatedAt)
        if err != nil {
            return nil, fmt.Errorf("failed to scan school: %w", err)
        }
        school.ID = fmt.Sprintf("%d", id)
        if address.Valid { school.Address = &address.String }
        if phone.Valid { school.Phone = &phone.String }
        schools = append(schools, &school)
    }

    if err = rows.Err(); err != nil {
        return nil, fmt.Errorf("error reading schools: %w", err)
    }

    return schools, nil
}

func (r *schoolRepository) UpdateSchool(ctx context.Context, schoolID int64, updateData entities.School) (*entities.School, error) {
    query := `
        UPDATE schools 
        SET name = $2, address = $3, phone_number = $4, updated_at = NOW()
        WHERE id = $1
        RETURNING id, name, code, address, phone_number, created_at, updated_at
    `
    var s entities.School
    var id int64
    var address sql.NullString
    var phone sql.NullString
    err := r.db.QueryRowContext(ctx, query,
        schoolID,
        updateData.SchoolName,
        updateData.Address,
        updateData.Phone,
    ).Scan(&id, &s.SchoolName, &s.SchoolID, &address, &phone, &s.CreatedAt, &s.UpdatedAt)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("school not found for update: %d", schoolID)
        }
        return nil, fmt.Errorf("failed to update school: %w", err)
    }
    s.ID = fmt.Sprintf("%d", id)
    if address.Valid { s.Address = &address.String }
    if phone.Valid { s.Phone = &phone.String }
    return &s, nil
}

func (r *schoolRepository) DeleteSchool(ctx context.Context, schoolID int64) error {
    query := `DELETE FROM schools WHERE id = $1`
    result, err := r.db.ExecContext(ctx, query, schoolID)
    if err != nil {
        return fmt.Errorf("failed to delete school: %w", err)
    }

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("school not found with id: %d", schoolID)
	}

	return nil
}

func (r *schoolRepository) GetSchoolStats(ctx context.Context, schoolID int64) (map[string]interface{}, error) {
    // Return basic stats from users table
    stats := map[string]interface{}{}
    var total, active int
    if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*), COALESCE(SUM(CASE WHEN is_active THEN 1 ELSE 0 END),0) FROM users WHERE school_id = $1`, fmt.Sprintf("%d", schoolID)).Scan(&total, &active); err == nil {
        stats["total_users"] = total
        stats["active_users"] = active
    }
    return stats, nil
}

func (r *schoolRepository) GetSchoolUsers(ctx context.Context, schoolID int64, role string) ([]*entities.User, error) {
    query := `
        SELECT id, firebase_uid, name as display_name, email, role, school_id, created_at, updated_at
        FROM users 
        WHERE school_id = $1
    `
	
    args := []interface{}{fmt.Sprintf("%d", schoolID)}
	if role != "" {
		query += " AND role = $2"
		args = append(args, role)
	}
	
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get school users: %w", err)
	}
	defer rows.Close()

	var users []*entities.User
	for rows.Next() {
		var user entities.User
		err := rows.Scan(
			&user.ID,
			&user.FirebaseUID,
			&user.DisplayName,
			&user.Email,
			&user.Role,
			&user.SchoolID,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, &user)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading users: %w", err)
	}

	return users, nil
}
