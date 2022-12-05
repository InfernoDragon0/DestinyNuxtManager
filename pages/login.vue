<template>
    <div>
        <h1 class="text-3xl font-bold underline text-yellow-400">
            Logging in..
        </h1>
    </div>
</template>

<script setup lang="ts">
onMounted(() => {

    //get bungieToken from cookie
    const bungieToken = useCookie("bungieToken")
    console.log(JSON.stringify(bungieToken.value!))
    //if bungieToken is null, redirect to index
    if (!bungieToken.value) {
        window.location.href = "/"
    }
    else {
        //store bungieToken in localstorage
        localStorage.setItem("bungieToken", JSON.stringify(bungieToken.value!))
        bungieToken.value = null
        window.location.href = "/vault"
    }
})



</script>