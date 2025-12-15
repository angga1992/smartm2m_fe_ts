# Submission Instructions

## ⏱️ Timeline

- **Maximum time**: 3 days from the moment you receive this assignment.
- You may resubmit anytime before the deadline; we review the latest submission.

---

## 📦 Deliverables

1. A **public** repository **or** public Gist containing your solution.
2. A top-level **README.md** that includes:

   - How to run the project locally
   - Any assumptions or notes
   - (Optional) screenshots or a short GIF

3. The project must build and run on Node 18+ or 20+.
4. Do not commit secrets or API keys.

(Optional) Deploy a live demo and include the URL in your README.

---

## 🚀 Submission (HTTP API)

- **Endpoint**: `https://fe-test-server.vercel.app/api/send-quiz`

- **Method**: `POST`

- **Headers**:

  - `Content-Type: application/json`
  - `Authorization: Basic <BASE64>` where `<BASE64>` is the Base64 encoding of the literal string:

    `fe-test-candidate:HRUIY87zQAbQ7Lvo2OHA4yr8ifQRxcD0jvEVZh2U4qa7YWOywfSJP4kv6MGppwkdi`

  _(i.e., Basic Auth header must be the Base64 of `username:password`)_

- **JSON Payload** must include the following fields:

  - `name` (string)
  - `email` (string)
  - `repo_url` (string; URL to your public repo or Gist)

Use HTTPS for transport. Keep credentials secure.

---

## ✉️ After You Submit

Send a confirmation email to **[angel@smartm2m.co.kr](mailto:angel@smartm2m.co.kr)** and **[ilham@smartm2m.co.kr](mailto:ilham@smartm2m.co.kr)** containing:

- Your full name
- Your email
- Repository/Gist URL
- (Optional) live demo URL

---

## ✅ Final Checklist

- [ ] Submitted within **3 days**
- [ ] Public repo/Gist link included
- [ ] README includes run steps & assumptions
- [ ] POSTed to the endpoint with **HTTP Basic Auth** using the provided credentials
- [ ] Payload contains **name**, **email**, **repo_url**
- [ ] Confirmation email sent to both recipients
- [ ] No secrets committed; builds on Node 18/20

If anything is unclear, state your assumptions in the README and proceed.
