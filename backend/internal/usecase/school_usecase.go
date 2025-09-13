package usecase

import (
	"context"
	"fmt"

	"github.com/rikut0904/bloomia/backend/internal/domain/entities"
	"github.com/rikut0904/bloomia/backend/internal/domain/repositories"
	"github.com/rikut0904/bloomia/backend/internal/infrastructure/config"
)

type SchoolUsecase struct {
	schoolRepo repositories.SchoolRepository
	userRepo   repositories.UserRepository
	config     *config.Config
}

func NewSchoolUsecase(schoolRepo repositories.SchoolRepository, userRepo repositories.UserRepository, cfg *config.Config) *SchoolUsecase {
	return &SchoolUsecase{
		schoolRepo: schoolRepo,
		userRepo:   userRepo,
		config:     cfg,
	}
}

func (u *SchoolUsecase) CreateSchool(ctx context.Context, school *entities.School) (*entities.School, error) {
	// TODO: Implement school creation with current schema
	return u.schoolRepo.CreateSchool(ctx, school)
}

func (u *SchoolUsecase) GetSchoolByID(ctx context.Context, schoolID int64) (*entities.School, error) {
	return u.schoolRepo.GetSchoolByID(ctx, schoolID)
}

func (u *SchoolUsecase) GetSchoolByCode(ctx context.Context, code string) (*entities.School, error) {
	return u.schoolRepo.GetSchoolByCode(ctx, code)
}

func (u *SchoolUsecase) GetAllSchools(ctx context.Context, filters map[string]interface{}) ([]*entities.School, error) {
	return u.schoolRepo.GetAllSchools(ctx, filters)
}

func (u *SchoolUsecase) UpdateSchool(ctx context.Context, schoolID int64, updateData entities.School) (*entities.School, error) {
	return u.schoolRepo.UpdateSchool(ctx, schoolID, updateData)
}

func (u *SchoolUsecase) DeleteSchool(ctx context.Context, schoolID int64) error {
	return u.schoolRepo.DeleteSchool(ctx, schoolID)
}

func (u *SchoolUsecase) GetSchoolStats(ctx context.Context, schoolID int64) (map[string]interface{}, error) {
	return u.schoolRepo.GetSchoolStats(ctx, schoolID)
}

func (u *SchoolUsecase) GetSchoolUsers(ctx context.Context, schoolID int64, role string) ([]*entities.User, error) {
	return u.schoolRepo.GetSchoolUsers(ctx, schoolID, role)
}

func (u *SchoolUsecase) ValidateSchoolCode(ctx context.Context, code string) (bool, error) {
	school, err := u.schoolRepo.GetSchoolByCode(ctx, code)
	if err != nil {
		return true, nil // School not found means code is available
	}
	return school == nil, nil
}

func (u *SchoolUsecase) CreateStudentForSchool(ctx context.Context, schoolID int64, student *entities.User) (*entities.User, error) {
	// TODO: Implement with current schema - for now return not implemented
	return nil, fmt.Errorf("student creation not implemented for current schema")
}