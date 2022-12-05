<template>
    <div>
        <h1 class="text-3xl font-bold underline text-yellow-400">
            Vault
        </h1>
        <button @click="logout">Logout</button>
        <button @click="readData">read Data</button>
    </div>
</template>

<script setup lang="ts">

    onMounted(() => {
        const data = localStorage.getItem("bungieToken")
        if (!data) {
            window.location.href = "/"
        }
        else {
            loadData()
        }
    })
    const logout = () => {
        localStorage.removeItem("bungieToken")
        window.location.href = "/"
    }
    
    const loadData = async () => {
        //fetch json names from bungo
        let storageRoot = null;
        try {
            storageRoot = await navigator.storage.getDirectory();
            console.log(storageRoot)
        }
        catch( err ) {
            console.error( err );
            alert( "Couldn't open OPFS. See browser console.\n\n" + err );
            return;
        }
        
        const dataDir = await storageRoot.getDirectoryHandle("bungiemanifest", {create: true});

        //$fetch data
        const {data:message} = await useAsyncData('message', () => $fetch('/api/getManifest', {
                            method: 'GET', 
                    }), {initialCache: false})

        console.log(message.value)
        const data = message.value

        if (data.Response) {
            const english = data.Response.jsonWorldComponentContentPaths.en
            var downloads = [
                english.DestinyPlugSetDefinition, 
                english.DestinyItemCategoryDefinition,
                english.DestinyInventoryItemDefinition,
                english.DestinySandboxPerkDefinition]
        
            for (var i = 0; i < downloads.length; i++) {
                var download = downloads[i]
                var check = download.split('/').at(-1)
                
                try { //see if the bungiemanifest is available
                    const fileHandle = await dataDir.getFileHandle(check);
                    console.log(`${check} exists, no need to redownload`)

                    const file = await fileHandle.getFile();
                    const contents = await file.text();
                    
                    console.log(file.size)

                    var keyName = check.split('-')[0]
                    //definitions[keyName] = JSON.parse(fs.readFileSync(`./definitions/${check}`, 'utf8'));

                    continue
                }
                catch( err ) { //download the files if not exist
                    console.log("Check doesnt exist " + check)
                    console.log("fetching from " + `https://www.bungie.net${download}`)

                    fetch(`https://www.bungie.net${download}`, {
                        method: 'GET',
                        }).then((response) => {
                            if (response.ok) {
                                console.log("pulling from " + response.url)
                                response.json().then(async (r) => {
                                    var filename = response.url.split('/').at(-1)
                                    var filedata = JSON.stringify(r)
                                    //string to blob
                                    var blob = new Blob([filedata])
                                    //blob to opfs file
                                    try {
                                        const fileHandle = await dataDir.getFileHandle(filename!, {create: true});
                                        const writable = await fileHandle.createWritable();
                                        await writable.write(blob);
                                    }
                                    catch (err) {
                                        console.error(err)
                                    }
                                    console.log("pulled successfully for " + filename) //due to race conditions this is always the last arary
                                    
                                    var keyName = filename!.split('-')[0]
                                    //definitions[keyName] = r;
                                })
                            }
                        })
                    .catch((error) => {
                        console.log("Could not download " + download + " due to " + error)
                    })
                }
            }
        }
    
    }
</script>