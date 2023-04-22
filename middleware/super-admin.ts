export default defineNuxtRouteMiddleware(async (to, from) => {
    const { data } = useAuth()

    if (!data) {
        return await navigateTo('/404')
    }

    const email = data.value?.user?.email

    if (!email) {
        return await navigateTo('/404')
    }

    const id = email.substring(1, 10)

    if (id !== useRuntimeConfig().ADMIN) {
        return await navigateTo('/404')
    }
})