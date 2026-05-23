# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-05-23

### Fixed
- Removed hardcoded developer contact info from ContactDeveloper.tsx (now uses environment variables)
- Updated Contact API to use environment variables for developer contact
- Removed unused variable in LoginForm.tsx
- Improved XSS protection by using environment variables for sensitive display data

### Security
- Developer WeChat ID now loaded from PUBLIC_DEVELOPER_WECHAT env var
- Developer Email now loaded from PUBLIC_DEVELOPER_EMAIL env var
- API contact endpoint updated to use environment variables

## [1.0.0] - 2026-05-19

### Added
- Initial production release
- AI Tools library (33 tools)
- Payment solutions (20+)
- University policies (42 universities)
- Prompt templates (30+)
- Survival guides (20+)
- Q&A community
- Campus map (100+ markers)
- Offer showcase
