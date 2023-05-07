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

    const admin = await prisma.admin.findUnique({
        where: { id: parseInt(studentId) },
        select: null,
    })

    if (!admin) {
        throw createError({
            statusCode: 401,
            message: '不在管理員名單中',
        })
    }

    if (studentId !== process.env.ADMIN) {
        const VS = await prisma.voting.findUnique({
            where: { id: parseInt(id) },
            select: {
                startTime: true,
            },
        })

        if (!VS) {
            throw createError({
                statusCode: 404,
                message: 'Not Found',
            })
        }

        if (Date.now() >= VS.startTime.getTime()) {
            throw createError({
                statusCode: 403,
                message: '投票已開始，不可刪除',
            })
        }
    }

    await prisma.voting.delete({
        where: { id: parseInt(id) },
        select: null,
    })

    return {}
})