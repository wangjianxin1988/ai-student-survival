# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3] - 2026-05-23

### Fixed
- Added ESLint configuration to resolve linting errors
- Fixed unused variable issues in multiple components (LoginForm, RegisterForm, ContactDeveloper, etc.)
- Fixed PostCard.tsx case block declarations (added braces for lexical declarations)
- Fixed CampusMap.tsx unused university variable
- Fixed ShareButton.tsx unused image prop
- Fixed CommunityFeed.tsx catch block error handling
- Fixed CompareButton.tsx unused props
- Fixed AddMarkerForm.tsx unused onSubmit prop
- Fixed MapPage.tsx unused markerUniIds
- Fixed OfferComment.tsx unused translations
- Fixed content-moderation.ts regex pattern warnings
- Fixed paymentSolutions.ts escape character warnings
- Fixed env.d.ts triple-slash reference warning

### Code Quality
- Created proper ESLint configuration (.eslintrc.json)
- Improved TypeScript strictness compliance
- Enhanced error handling consistency across components

### Documentation
- Updated CHANGELOG.md for v1.0.3

## [1.0.2] - 2026-05-23

### Fixed
- Bug fixes from QA testing

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
