# The Singapore Way - Interactive Tool Setup

## Files in this package

- `index.html` - complete front-end tool: Pupa Quiz V7-style landing page, 10-question diagnostic, image-backed question cards, email gate, calculating screen, assessment-dashboard result page, Google Sheets logging hook, and optional Mailchimp tag hook.
- `google_apps_script.gs` - paste this into Google Apps Script to turn a Google Sheet into the database.

## What is included in this final version

- Landing page follows the Pupa Quiz V7 pattern: centered shell, large hero image, one main question, optional name/organization fields, and one CTA: `Let's find out`.
- No brand strip, no hero text overlay, and no extra explanatory landing copy.
- The `Before we begin` step is removed. The CTA opens Question 1 directly.
- Every quiz question includes an image area. Replace the URLs in `QUESTION_IMAGES` when ready.
- Email gate has no image and does not show internal `Offer` language to the user.
- Result page follows the attached assessment-dashboard style: top assessment bar, score ring, key insight, assessment summary, five-pillar overview, working-well section, priority story, 90-day moves, resources, and book CTA.
- Google Sheets stores the full database: events, leads, answers, scores, routing tags, and CTA clicks.

## 1) Set up the Google Sheet database

1. Create a new Google Sheet.
2. Name it something like `The Singapore Way Tool Database`.
3. Go to `Extensions > Apps Script`.
4. Delete the starter code.
5. Paste the full contents of `google_apps_script.gs`.
6. Click Save.
7. Click `Deploy > New deployment`.
8. Select type: `Web app`.
9. Execute as: `Me`.
10. Who has access: `Anyone`.
11. Deploy and authorize.
12. Copy the Web App URL.

## 2) Add the Google Sheet URL to the HTML

Open `index.html` and find:

```js
GOOGLE_SHEETS_WEB_APP_URL: 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
```

Replace the placeholder with your deployed Apps Script Web App URL.

## 3) Replace image placeholders

Open `index.html` and find:

```js
HERO_IMAGE_URL: 'https://static.wixstatic.com/media/d1daaa_a4dba8d94aba4c9a930de04f9ab567ed~mv2.png'
```

Then find:

```js
const QUESTION_IMAGES = {
```

Replace the image URLs for `role`, `country`, `stage`, `execution`, `systems`, `economy`, `talent`, `governance`, `urgent_need`, and `desired_outcome` with your final question images.

## 4) Optional Mailchimp setup

The tool calculates and stores the correct internal tag names in Google Sheets:

- `Offer A`
- `Offer B`
- `Offer C`
- `Offer D`
- `Offer E`
- `Tool Nurture Sequence`

The word `Offer` is kept internal only and is not shown on the landing page, email gate, or result page.

To submit directly to Mailchimp from the tool, replace these placeholders in `index.html`:

```js
MAILCHIMP_POST_JSON_URL: 'PASTE_YOUR_MAILCHIMP_POST_JSON_URL_HERE'
MAILCHIMP_HONEYPOT_FIELD: 'b_PASTE_U_PASTE_ID'
MAILCHIMP_TAG_IDS: {
  'Offer A': 'PASTE_OFFER_A_TAG_ID',
  'Offer B': 'PASTE_OFFER_B_TAG_ID',
  'Offer C': 'PASTE_OFFER_C_TAG_ID',
  'Offer D': 'PASTE_OFFER_D_TAG_ID',
  'Offer E': 'PASTE_OFFER_E_TAG_ID',
  'Tool Nurture Sequence': 'PASTE_NURTURE_TAG_ID'
}
```

Mailchimp embedded forms usually expect numeric tag IDs, not tag names. The tag names are still logged to Google Sheets either way.

Recommended Mailchimp merge fields:

- `FNAME` for first name
- `ORG` for organization
- `WEAKEST` for weakest pillar
- `SCORE` for score

## 5) Test the full flow

1. Open `index.html` in a browser.
2. Confirm the landing page has only the hero image, main question, optional name/organization fields, and `Let's find out` CTA.
3. Enter optional name and organization.
4. Click `Let's find out`.
5. Confirm Question 1 opens directly and the question image appears.
6. Complete all 10 questions.
7. Confirm the email gate has no image and does not show the word `Offer`.
8. Submit an email and tick the consent checkbox.
9. Confirm the calculating screen appears.
10. Click `See my result`.
11. Confirm the assessment-dashboard result page appears with score, band, five-pillar overview, most exposed pillar, 3 moves, resources, and book CTA.
12. Confirm the Google Sheet creates these tabs:
    - `Tool_Events`
    - `Tool_Leads`
    - `Summary`

## 6) What gets stored

The Google Sheet receives:

- Session ID
- Optional name and organization
- Email and consent
- Every answer
- Raw pillar scores
- Total score
- Band label
- Strongest pillar
- Weakest pillar
- Offer tag
- Nurture tag
- Result and CTA click events
- Page URL, referrer, and user agent

## 7) Scoring logic inside the tool

Each scored answer is 1 to 4 and is multiplied by 5.

- Governance & Integrity = Q8 x 5
- Execution Speed = Q4 x 5
- Talent & Trust = Q7 x 5
- Systems & Infrastructure = Q5 x 5
- Economy & Openness = Q6 x 5

Weakest-pillar tie break:

1. Governance & Integrity
2. Execution Speed
3. Talent & Trust
4. Systems & Infrastructure
5. Economy & Openness

Strongest-pillar tie break:

1. Economy & Openness
2. Systems & Infrastructure
3. Talent & Trust
4. Execution Speed
5. Governance & Integrity
