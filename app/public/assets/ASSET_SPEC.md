# BabyGrowth Asset Specification

**Version:** 1.0
**Updated:** 2026-08-18
**Scope:** `app/public/assets/`
**Audience:** Design, Frontend, QA, and Content teams

## 1. Purpose

This document defines the current image inventory and the recommended assets to add for the BabyGrowth product. It is the source of truth for asset names, folder placement, dimensions, format, visual direction, usage context, and acceptance criteria.

The visual goal is warm, safe, calm, and family-oriented. New artwork must feel appropriate for a baby-care application and must not look clinical, alarming, cold, or overly technical.

## 2. Folder structure and naming

```text
app/public/assets/
├── ASSET_SPEC.md
├── avatars/
├── decor/
├── illustrations/
├── activities/
├── mom/
└── timeline/
```

Use lowercase `kebab-case` for all new names. Do not use spaces, accents, personal names, or version suffixes in production filenames.

| Folder | Purpose | Example |
|---|---|---|
| `avatars/` | Family, caregiver, or assistant portraits | `ai-doctor-avatar.png` |
| `decor/` | Small card decorations, usually with transparency | `care-milk.png` |
| `illustrations/` | Hero images, onboarding, explanatory visuals, empty states | `empty-growth.png` |
| `activities/` | Baby activity icons or illustrations | `baby-feeding.png` |
| `mom/` | Postpartum and mother-care visuals | `postpartum-recovery.png` |
| `timeline/` | Journal, photo, and video placeholders | `timeline-memory-placeholder.png` |

## 3. Shared visual rules

### 3.1 Style

Use **Flat Editorial Vector Art**: simple flat shapes, organic curves, soft rounded corners, restrained detail, and tUse **Flat Elinework. A very light paper texture is allowed, but it must not reduce clarity at small sizes.

Characters should have natural anatomy, calm expressions, and recognizable silhouettes. Avoid photorealism, glossy 3D rendering, manga/anime, pixel art, stock-photo styling, thick black outlines, neon colors, and medical imagery unless specifically requested.

### 3.2 Palette

| Role | Color | Hex |
|---|---|---|
| Warm canvas | Warm ivory | `#FAF8F5` |
| Card surface | White | `#FFFFFF` |
| Main brand green | Olive sage | `#8DA06F` |
| Light green | Sage light | `#E5ECD9` |
| Brand brown | Warm brown | `#4A372E` |
| Primary text | Deep warm brown | `#2D231E` |
| Positive accent | Positive accent | Positive accent | Positive accent | Positive accent |mot| Positive accent | Positive accent | Positive accent | Positive accent | Posiset and no more than one strong accent. Avoid putting copy| Positive accent | Positive accent | Positive accent | Positive accent | Positive accent |mot| Positive accent | Positive accent | Positive accent | Positive accent | Posiset and no more than one strong accent. Avoid ps | PNG | Yes | 256 or 512 square |
| Avatars | JPEG or PNG | Optional | 1024 square |
| Hero and empty state | WebP or PNG | Optional | 800 to 1200 px long side |
| Timeline placeholder | WebP or JPEG | No | 1200 x 800 or 1200 x 675 |

Transparent PNGs must have clean edges on both ivory and white backgrounds. Do not export a white canvas behind an asset that is intended to float over a card.

## 4. Existing assets: preserve these paths

| F| F| F| F| F| F| F| F| F| F| F| F|---|---|---:|
| `illustrations/growth_cover.jpg` | Growth cover/banner | 1376 x 768 |
| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avatar| `avhe references in `app/src`.

## 5. P0 assets: recommended first batch

### AS-001: Empty Timeline

| Field | Specification |
|---|---|
| File | `illustrations/empty-timeline.png` |
| Size | 800 x 600 px, 4:3 |
| Use | `/timeline` and the empty daily journal on Home |
| Subject | Open journal, small stars, and a subtle heart or family symbol |
| Composition | Centered or slightly right-weighted; leave at least 25% lower space for UI copy and CTA |
| Colors | Sage, warm brown, honey amber, ivory |
| Avoid | Text, specific dates, watermark, hospital or medical symbols |
| Acceptance | Still reads as a memory journal at 180 px wide and does not compete with the Add action |

### AS-002: Empty Growth

| Field | Specification |
|---|---|
| File | `illustrations/empty-growth.png` |
| Size | 800 x 600 px, 4:3 |
| Use | `/growth` before the first measurement |
| Subject | Small plant or growth ruler beside a simplified baby silhouette |
| Composition | Vertical, centered, with open space for the measurement prompt |
| Colors | Sage, light sage, honey amber, warm brown |
| Avoid | Fake percentile values, medical charts, diagnosis language, text |
| Acceptance | Encourages starting growth tracking without implying a health problem |

### AS-003: Empty Expenses

| Field | Specification |
|---|---|
| File | `illustrations/empty-expenses.png` |
| Size | 800 x 600 px, 4:3 |
| Use | `/expenses` before the first expense |
| Subject | Small wallet or envelope with simple family-planning circles |
| Composition | Compact and balanced, with clear space for Add Expense |
| Colors | Warm brown, sage, honey amber, small terracotta accent |
| Avoid | Bank branding, realistic cash, currency amounts, text |
| Acceptance | Feels friendly and organized, | Accepe a financial warning or advertisement |

### AS-004: Empty Reminders

| Field | Specification |
|---|---|
| File | `illustra| File | `illustra| File | `illustra| File | `illustra| File | `illustra|r lis| File | `illustra| File | `illustra| File | `illustra| File | `illustra| Fl star and check mark |
| Composition | Centered, with a readable silhouette at small size |
| Colors | Sage, pale lavender, honey amber, ivory |
| Avoid | Red warning bell, alarm styling, fixed time, text |
| Acceptance | Communicates that a reminder can be created without creating pressure |

### AS-005: AI Doctor Avatar

| Field | Specification |
|---|---|
| File | `avatars/ai-doctor-avatar.png` |
| Size | 512 x 512 px, 1:1 |
| Use | AI advice card and `AIDoctorChatModal` |
| Subject | Friendly assistant character in a subtle medical-inspired outfit; not a real person |
| Composition | Head and shoulders; face and shoulders inside the central 80% safe area |
| Colors | Ivory or pale sage clothing, sage/lavender accents, natural skin tones |
| Avoid | Hospital logos, emergency symbols, exaggerated stethoscope, embedded text |
| Acceptance | Recognizable at 40 px, trustworthy, calm, and non-judgmental |

### AS-006: Timeline Memory Placeholder

| Field | Specification |
|---|---|
| File | `timeline/timeline-memory-placeholder.png` | File | `timeline/timeline-memory-placeholder.png` | File | `timeoaded media |
| Subject | Empty photo frame, soft blanket, simple toy, or small branch |
| Composition | Central focal point; safe for 1:1 and 16:9 crops |
| Colors | Ivory, light sage, very light terracotta, warm brown |
| Avoid | Fake UI controls, text, dates, watermark |
| Acceptance | Supports the post content without overpowering the text |

## 6. P1 assets: second batch

| ID | File | Size | Screen | Design brief |
|---|---|---:|---|---|
| AS-007 | `illustrations/onboarding-family.png` | 1200 x 900 | Onboarding | Baby and caregiver in a warm home; leave a clear area for form content; communicate a welcoming start |
| AS-008 | `mom/pumping-session.png` | 512 x 512 | Mom Home and Add Pumping | Simplified breast pump or milk drop; no brand; soft, non-clinical treatment |
| AS-009 | `mom/postpartum-recovery.png` | 1000 x 700 | Mom Home | Mother resting in a quiet space; communicate recovery and self-care, not pain |
| AS-010 | `mom/mental-wellbeing.png` | 800 x 600 | EPDS and Mom Home | Breathing, flower, or balanced organic circles; do not imply a diagnosis |
| AS-011 | `illustrations/backup-f| AS-011 | `illustrations/backup-f| AS-011 | `illustrations/backfamily; communicate safety and successful recovery |
| AS-012 | `illu| AS-012 | `illu| AS-012 | `illu| AS-012 | `illu| file and Google Sync | Devices connected to a cloud with organic curves; do not add a Google logo without approval |
| AS-013 | `illustrations/family-care-team.png` | 800 x 600 | Timeline filters | Baby, mother, and caregiver connected by a heart or soft line; avoid rigid diagrams |
| AS-014 | `illustrations/calendar-memory.png` | 800 x 600 | Timeline | Paper calendar, dots, and a small memory symbol; no specific date |
| AS-015 | `timeline/timeline-video-placeholder.png` | 1200 x 675 | Timeline and Lightbox| AS-015 | `timeline/timeline-video-placeholder.png` | 1200 x 675 | Timeline and Lightbox| AS-015 | `timeline/timeline-video-placeholder.png` y replace Lucide icons in Quick Log and Timeline. They are not required for the MVP.

| File | Size | Subject | Accent |
|---|---:|---|---|
| `activities/baby-feeding.png` | 256 x 256 | Milk bottle or small bowl | Honey amber |
| `activities/baby-sleeping.png` | 256 x 256 | Sleeping baby under a blanket | Soft lavender |
| `activities/baby-diaper.png` | 256 x 256 | Folded diaper | Light terracotta |
| `activities/baby-medicine.png` | 256 x 256 | Minimal medicine bottle without label | Sage or lavender |
| `activities/baby-temperature.png` | 256 x 256 | Rounded thermometer | Very light terracotta |

All five icons must share the same stroke weight, visual scale, safe area, and corner treatment. Do not mix illustration styles within the same set.

## 8. Layout and safe-area rules

Hero and empty-state assets must work on narrow mobile screens, cards, and light crops. Keep the primary subject inside the central 70% of the canvas and avoid placing important details near the edges. Transparent assets should occupy approximately 60% to 80% of the canvas so the frontend can resize them without crowding.

Do not include copy, numbers, dates, CTA labels, or status messages inside artwork. Text must be rendered by HTML for Vietnamese localization, responsive layout, and accessibility.

## 9. QA checklist before merge

| Check | Acceptance condition |
|---|---|
| Filename | Exact spec name, lowercase kebab-case, no| Filename | Exact spec name, lowercase kebab-case, no| Filename | Exact spec name, lowercase kebab-cant PNG has no white background or colored fringe |
| Color | Uses the product palette; no neon or excessive saturation |
| Crop | Checked at 1:1, 4:3, 3:2, and 16:9 where relevant |
| Content | No unrequested text, logo, watermark, or metrics |
| Small display | Subject remains recognizable at 40 to 64 px for icons/avatars |
| Accessibility | Decorative images use `alt=""` and `aria-hidden="true"`; meaningful images receive descriptive alt text from the component |
| Performance | Hero/placeholder files are compressed; icons and decor are optimized |
| Integration | Frontend path matches `/assets/...`; filename will not change after merge |

## 10. Handoff process

Design exports each file with the exact name and size in this document and places it in the matching folder. Frontend verifies path, responsive crop, loading, and empty-state behavior. QA checks transparency, contrast, small-size readability, and mobile display.

Every asset pull request should include a preview and state the filename, screen, source dimensions, format, alpha status, and whether it was tested on `#FAF8F5` and white surfaces.
