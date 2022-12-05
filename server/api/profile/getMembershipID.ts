//export
export default defineEventHandler(async (event) => {
    const membershipId = getQuery(event).membershipId
    const access_token = getQuery(event).access_token

    const data = await fetch(`https://www.bungie.net/Platform/User/GetMembershipsById/${membershipId}/254/`,
        {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${access_token}`,
            'X-API-Key': process.env.BUNGIE_API_KEY!,
        },
    })
    if (data.ok) {
        const json = await data.json()
        if (json.Response) {
            if (json.Response.destinyMemberships.length > 0) {
                console.log("destiny ships")
                return({status:"success", membershipId: json.Response.primaryMembershipId, memberships: json.Response.destinyMemberships})
            }
            else {
                return {status:"error", error: "No Destiny Account Found"}
            }
        }
        else {
            return {status:"error", error: "No Response"}
        }
    }
    else {
        return {status:"error", error: await data.text()}
    }
})
