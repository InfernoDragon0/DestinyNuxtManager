//export the default
export default defineEventHandler(async (event) => {
    //get code from url query
    const code = getQuery(event).code
    const state = getQuery(event).state
    console.log(code)
    console.log(state)
    console.log(process.env.BUNGIE_API_KEY)

    //save code to session if state is same as in session

    //do a post request
    
    const body = new URLSearchParams({
        client_id: process.env.BUNGIE_CLIENT_ID,
        grant_type: "authorization_code",
        code: code,
        client_secret: process.env.BUNGIE_CLIENT_SECRET
    } as any)
    console.log(body.toString())
    const response = await fetch("https://www.bungie.net/platform/app/oauth/token/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body
    })

    //save the result in localStorage
    const data = await response.json()
    if (data.error) {
        return "Please try to login again."
    }
    else {
        setCookie(event, "bungieToken", JSON.stringify(data))
        sendRedirect(event, "/login")
        return "ok done"
    }
})