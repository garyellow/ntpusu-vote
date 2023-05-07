import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { id } = getQuery(event) as { id: string | undefined }

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request',
        })
    }

    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        throw createError({
            statusCode: 401,
            message: '未登入',
        })
    }

    const email = session.user.email
    const studentId = email.substring(1, 10)

    if (studentId != process.env.ADMIN) {
        throw createError({
            statusCode: 401,
            message: '不在管理員名單中',
        })
    }

    await prisma.admin.upsert({
        where: { id: parseInt(id) },
        create: { id: parseInt(id) },
        update: {},
        select: null,
    })

    return {}
})