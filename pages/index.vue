<template>
    <div>
        <h1 class="text-3xl font-bold underline text-yellow-400">
            Hello world!
        </h1>
        <button @click="login">Login</button>
    </div>
</template>

<script setup lang="ts">

//function to redirect to bungie oauth



const login = () => {
    randomString()
}

//function to generate a random string of length 10
const randomString = async () => {
    const {data:message} = await useAsyncData('message', () => $fetch('/api/createState', {
                            method: 'GET', 
                    }), {initialCache: false})
    console.log(message.value)
    window.location.href = "https://www.bungie.net/en/oauth/authorize?client_id=37392&response_type=code&state=" + message.value

}

</script>