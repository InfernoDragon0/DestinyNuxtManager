<template>
    <div>
        <h1 class="text-3xl font-bold underline text-yellow-400">
            Vault
        </h1>
        <p>{{statuss}}</p>
        <button @click="logout">Logout</button>
        <button @click="readData">read Data</button>

        <div class="grid grid-cols-4">
            <div class="grid grid-cols-1  max-h-screen overflow-scroll">
            
                <template v-for="item in returnData.allEquipment" :key="item.itemHash">
                    <!--tailwindcss grid for icon and description-->
                    <div class="grid grid-cols-1">
                        <div class="grid grid-cols-4 m-1 bg-slate-200">
                            <div class="grid-cols-1">
                                <nuxt-img class="w-10 h-10" :src="`https://bungie.net` + item.displayProperties.icon"/>
                            </div>
                            <div class="grid grid-rows-2 col-span-3">
                                <p class="text-sm font-thin">{{item.displayProperties.name}}</p>
                                <p class="text-xs text-gray-400" >{{item.itemTypeDisplayName}}</p>
                            </div>
                        </div>
                    </div>
                    

                </template>
            </div>
            <div class="grid col-span-2 grid-rows-2">
                <p>yes</p>
            </div>
            <div class="grid grid-cols-1">
                <p>yes</p>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
    const statuss = ref("Loading...")
    const playerInfo = ref({})
    const playerData = ref({})
    var definitions = {} as any
    var returnData = {} as any
    returnData.allEquipment = {}
    var datae: any

    onMounted(() => {
        datae = JSON.parse(localStorage.getItem("bungieToken")!)
        if (!datae) {
            window.location.href = "/"
        }
        else {
            loadPlayerData()
            loadData()
        }
    })
    const logout = () => {
        localStorage.removeItem("bungieToken")
        window.location.href = "/"
    }

    const loadPlayerData = async () => {
        statuss.value = "Loading player data..."
        //fetch player data from getMembershipID
        const access_token = encodeURIComponent(datae.access_token)
        const {data:message2,refresh} = await useAsyncData('message2', () => $fetch(`/api/profile/getMembershipID?membershipId=${datae.membership_id}&access_token=${access_token}`, {
                method: 'GET', 

        }))
        await refresh()
        console.log(message2.value)
        if (message2.value?.status != "error") {
            playerInfo.value = message2.value?.memberships[0]
            localStorage.setItem("primaryMembershipID", message2.value?.membershipId)
            loadAllData(message2.value?.membershipId, access_token, playerInfo.value.membershipType)
        }
    }

    const loadAllData = async (membership_id: string, access_token: string, membershipType: string) => {
        statuss.value = "Loading all data..."
        const {data:message3} = await useAsyncData('message3', () => $fetch(`/api/profile/retrievePlayerData?membershipId=${membership_id}&access_token=${access_token}&destinyMembershipType=${membershipType}`, {
                method: 'GET', 
        }))
        if (message3.value?.data) {
            const jsonData = JSON.parse(message3.value?.data)
            if (jsonData.Response.characters.data) {//characters
                statuss.value = "Loading characters..."
                returnData["characters"] = jsonData.Response.characters.data
            }
            if (jsonData.Response.characterInventories.data) { //character inventory, do the exact same thing for vault and equipment
                statuss.value = "Loading character inventory..."
                addRolls(jsonData.Response.characterInventories.data, 1, returnData, jsonData)
            }
            if (jsonData.Response.characterEquipment.data) { //character equipment
                statuss.value = "Loading character equipment..."
                addRolls(jsonData.Response.characterEquipment.data, 0, returnData, jsonData)
            }
            if (jsonData.Response.profileInventory.data) { //profile inventory
                statuss.value = "Loading profile inventory..."
                addRolls(jsonData.Response.profileInventory.data, 2, returnData, jsonData)
            }
        }
        statuss.value = "Loading complete!"

    }
    
    const loadData = async () => {
        //fetch json names from bungo
        let storageRoot = null;
        try {
            storageRoot = await navigator.storage.getDirectory();
        }
        catch( err ) {
            console.error( err );
            statuss.value = "Failed to open OPFS Storage, please try again later."
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
                    statuss.value = "Loading Destiny Manifest " + i + "/" + downloads.length
                    console.log(`${check} exists, no need to redownload`)

                    const file = await fileHandle.getFile();
                    const contents = await file.text();

                    var keyName = check.split('-')[0]
                    definitions[keyName] = JSON.parse(contents);

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
                                    statuss.value = "Downloading " + filename

                                    try {
                                        const fileHandle = await dataDir.getFileHandle(filename!, {create: true});
                                        const writable = await fileHandle.createWritable();
                                        await writable.write(blob);
                                        await writable.close();

                                    }
                                    catch (err) {
                                        console.error(err)
                                    }
                                    console.log("pulled successfully for " + filename) //due to race conditions this is always the last arary
                                    
                                    var keyName = filename!.split('-')[0]
                                    definitions[keyName] = r;
                                })
                            }
                        })
                    .catch((error) => {
                        console.log("Could not download " + download + " due to " + error)
                        statuss.value = "Loading failed, please try again later."
                        return
                    })
                }
            }
            statuss.value = "Loading Complete"
            
        }
    
    }

    const addRolls = (dataset: any, locationin: number, returnData: any, data: any) => {
        if (locationin == 2) { //vault data
            for(var j in dataset.items) {
                var item = dataset.items[j]
                //each roll = {itemInstanceId, location, itemcomponents.instances.data, itemcomponents.stats.data, itemcomponents.perks.data}
                addRollsHelper(item, locationin, returnData, data, locationin)
            }
        }
        else {
            for (var k in dataset) {
                for(var j in dataset[k].items) {
                    var item = dataset[k].items[j]
                    //each roll = {itemInstanceId, location, itemcomponents.instances.data, itemcomponents.stats.data, itemcomponents.perks.data}
                    addRollsHelper(item, locationin, returnData, data, k)
                }
            }
        }
        playerData.value = returnData

        
    }

    const addRollsHelper = (item: any, locationin: number, returnData: any, data: any, key: any) => {
        var roll = {
            itemHash: item.itemHash,
            itemInstanceId: item.itemInstanceId,
            location: key,
            locationIn: locationin, //0 = equipped, 1 = inventory, 2 = vault
            instanceData: (item.itemInstanceId in data.Response.itemComponents.instances.data) ? data.Response.itemComponents.instances.data[item.itemInstanceId] : {},
            statsData: (item.itemInstanceId in data.Response.itemComponents.stats.data) ? data.Response.itemComponents.stats.data[item.itemInstanceId] : [],
            perksData: (item.itemInstanceId in data.Response.itemComponents.sockets.data) ? data.Response.itemComponents.sockets.data[item.itemInstanceId].sockets : [],
        }

        if (roll.statsData.length == 0 || roll.perksData.length == 0) {
            return //skip things that have no stats or perks like bounties
        }

        //now each perk needs the description and name appended to perks data
        for (var l in roll.perksData) {
            var perk = roll.perksData[l]
            if (!perk.plugHash) continue
            const perkReadable = definitions["DestinyInventoryItemDefinition"][perk.plugHash].displayProperties
            perk["displayProperties"] = perkReadable
        }

        //filter empty perks and only show first 5
        roll.perksData = roll.perksData.filter((perkdata: any) => { return perkdata.plugHash ? true : false}).slice(0,5)

        if (item.itemHash in returnData.allEquipment) { //append to rolls
            //console.log("itemHash exist is " + item.itemHash)
            returnData.allEquipment[item.itemHash].rolls.push(roll)
        }

        //[{itemHash: itemHash, displayProperties: DisplayProperties, rolls: [{roll1}, {roll2}, {roll3}], perkPool: PlugSet}]
        else { //create new item in the allEquipment

            const itemReadable = definitions["DestinyInventoryItemDefinition"][item.itemHash]
            const defaultItemReadable = definitions["DestinyPlugSetDefinition"]

            if (!itemReadable.sockets || !itemReadable.sockets.socketEntries) {
                console.log("no sockets in " + item.itemHash)
                return
            }

            var showCats = [1,2,3,4, 20,21,22,23]
            if (!showCats.includes(itemReadable.itemCategoryHashes[0]) || itemReadable.itemCategoryHashes.length < 2) {
                console.log("item not for show: " + item.itemHash)
                return
            }

            var itemdata = {
                itemHash: item.itemHash,
                displayProperties: itemReadable.displayProperties,
                itemTypeDisplayName: itemReadable.itemTypeDisplayName,
                itemTypeAndTierDisplayName: itemReadable.itemTypeAndTierDisplayName,
                itemCategoryHashes: itemReadable.itemCategoryHashes,
                screenshot: itemReadable.screenshot,
                rolls: [roll],
                defaultRolls: itemReadable.sockets.socketEntries.slice(1,5)
            }
            
            for (var socketid in itemdata.defaultRolls) { //some weird sht going on here
                itemdata.defaultRolls[socketid].plugSet = []
                var plugSetHash
                //take the plugSetHash from the DestinyInventoryItemDefinition
                if (!itemdata.defaultRolls[socketid].randomizedPlugSetHash && !itemdata.defaultRolls[socketid].reusablePlugSetHash) {
                    continue //skip if both are not present
                }
                else if (!itemdata.defaultRolls[socketid].randomizedPlugSetHash) {
                    plugSetHash = itemdata.defaultRolls[socketid].reusablePlugSetHash
                    //console.log(`on ${itemdata.itemHash} no randomized plugs: ` + JSON.stringify(itemdata.defaultRolls[socketid]))
                }
                else {
                    plugSetHash = itemdata.defaultRolls[socketid].randomizedPlugSetHash
                }

                //find it in the DestinyPlugSetDefinition
                var plugSet = defaultItemReadable[plugSetHash].reusablePlugItems
                for (var plugId in plugSet) { //retrieve each of the individual plugHash 
                    var plugItemHash = plugSet[plugId].plugItemHash
                    var plugItemReadable = definitions["DestinyInventoryItemDefinition"][plugItemHash]
                    itemdata.defaultRolls[socketid].plugSet.push(plugItemReadable.displayProperties)
                    itemdata.defaultRolls[socketid].plugSet[plugId].plugItemHash = plugItemHash
                }
            }

            returnData.allEquipment[item.itemHash] = itemdata
        }
    }
</script>