
export default defineEventHandler(async (event) => {
    //random string generator length 10
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    //save the state to session
    

    return randomString
    
})