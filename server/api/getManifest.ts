//export
export default defineEventHandler(async (event) => {
    const data = await fetch(`https://www.bungie.net/Platform/Destiny2/Manifest/`,
            {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-API-Key': process.env.BUNGIE_API_KEY!,
            },
        })
    
    const json = await data.json()
    return json
})