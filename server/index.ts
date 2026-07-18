import 'dotenv/config'
import cors from 'cors'
import express from 'express'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/github/:username', async (req, res) => {
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    const [profile, repos] = await Promise.all([
      fetch(`https://api.github.com/users/${req.params.username}`, { headers }),
      fetch(`https://api.github.com/users/${req.params.username}/repos?sort=updated&per_page=6`, { headers })
    ])
    if (!profile.ok) throw new Error('GitHub user unavailable')
    res.json({ profile: await profile.json(), repos: await repos.json() })
  } catch { res.status(502).json({ message: 'GitHub is temporarily unavailable.' }) }
})

app.listen(process.env.PORT || 8787, () => console.log('API ready'))
