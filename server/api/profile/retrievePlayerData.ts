//export
export default defineEventHandler(async (event) => {
    const destinyMembershipType = getQuery(event).destinyMembershipType
    const membershipId = getQuery(event).membershipId
    const access_token = getQuery(event).access_token

    const getURL = new URL(`https://www.bungie.net/Platform/Destiny2/${destinyMembershipType}/Profile/${membershipId}/` +
        `?components=Characters,CharacterEquipment,CharacterInventories,ProfileInventories,ItemInstances,ItemPerks,ItemStats,ItemSockets`)

    const data = await fetch(getURL,
        {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${access_token}`,
            'X-API-Key': process.env.BUNGIE_API_KEY!,
        },
    })

    
    if (data.ok) {
        const dataJSON = await data.text()
        return {status:"success", data: dataJSON}
        
    }
    else {
        return {status:"error", error: JSON.stringify(data)}
    }

})

