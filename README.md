# Karthikeya Sriram Portfolio

## Run locally

```bash
npm install
npm run dev
```

## Contact form

The contact form uses [Web3Forms](https://web3forms.com). Create an access key for `karthiksriram.dev@gmail.com`, then add it to a local `.env` file:

```bash
VITE_WEB3FORMS_KEY=your_access_key
```

The access key is designed to be used client-side. Configure the allowed domain in the Web3Forms dashboard before deploying.

## Deploy to Vercel

This portfolio is a static Vite application, so it can be deployed on Vercel's free tier without Docker.

1. Push this repository to GitHub.
2. Import it in Vercel.
3. Use the automatically detected settings: `npm run build` and `dist`.
4. Add `VITE_WEB3FORMS_KEY` under **Project Settings → Environment Variables**.
5. Deploy.

The optional Express GitHub proxy is not needed for the current portfolio build. If it is enabled later, deploy it as a separate service or convert the route to a Vercel Function.
