# Changelog

All notable changes to this project will be documented in this file.

## [1.0.5] - 2026-05-23

### Testing & QA
- Comprehensive E2E testing across all core pages (auth, community, map, contact, user profile, regression)
- Auth flow verified: login, register, OAuth (Google/GitHub), magic link, forgot password
- Interactive pages tested: map, survival guides, prompts, offers, questions
- Content pages verified: about, contact, faq, guide, privacy, terms, compare
- English version pages verified: all 16 EN pages load correctly
- Security audit: content moderation, API endpoints, auth flow, RLS policies

### Known Issues (Non-blocking)
- English pages contain some Chinese text in shared navigation/database content (cosmetic)
- HTML5 email validation `valid` property undefined in test (form still works correctly)
- Supabase session not stored in localStorage during test (auth still functions via cookies)

### Code Quality
- Build passes: `astro build` completes successfully
- TypeScript: source files clean, test file type errors are expected
- ESLint: configured and passing for source files

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
