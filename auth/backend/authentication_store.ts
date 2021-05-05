import Redis from "ioredis"
import RedisJSON from "ioredis-json"

const sessionStore = new Redis(process.env.SESSION_REDIS)
const usersStore = new RedisJSON(process.env.USERS_REDIS)

sessionStore.config('SET', 'stop-writes-on-bgsave-error', "no")

sessionStore.on("error", (error) => {
    console.error("SESSION_REDIS_ERROR:", error)
})

usersStore.on("error", (error) => {
    console.error("USERS_REDIS_ERROR:", error)
})

const sessionKey = (sessionToken: string) => `session-${sessionToken}`

class AuthStore {
    async newSession(sessionToken: string) {
        const session = { sessionToken }
        await sessionStore.setex(sessionKey(sessionToken), 60 * 60 * 72,  JSON.stringify(session))
        return session
    }

    async resumeSession(sessionToken: string) {
        const session = await sessionStore.get(sessionKey(sessionToken))
        return JSON.parse(session)
    }

    async saveSession(session: any) {
        return sessionStore.setex(session.sessionToken, 60*60*24*31, JSON.stringify(session))
    }

    async startAuthentication(token: string, email: string) {
        return sessionStore.setex(token, 600, JSON.stringify({ email }))
    }

    async finishAuthentication(token: string) {
        const authResult = await sessionStore.get(token).then((r) => JSON.parse(r))
        const userInfo = await usersStore.get(authResult.email, '.')

        if (!userInfo) {
             await usersStore.set(authResult.email, '.', {
                newUser: true
            })
        }

        return {
            email: authResult.email,
            newUser: !!userInfo
        }
    }
}

export default new AuthStore()