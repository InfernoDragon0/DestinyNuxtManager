<template>
    <div class="grid col-span-1 auto-rows-max">
        <div class="grid grid-cols-10 row-span-1">
            <div class="col-span-9 grid-rows-2">
                <h1>{{selectedWeapon.displayProperties?.name ? selectedWeapon.displayProperties?.name + ` [${selectedWeapon.filteredRolls.length} Rolls]`: "Select a Weapon"}}</h1>
                <p>{{selectedWeapon?.itemTypeAndTierDisplayName}}</p>
            </div>
            <div class="col-span-1 ">
                <div class="bg-blue-400 w-6 h-6 place-items-center">
                </div>
            </div>
            
        </div>
        <div class="grid grid-rows-5 row-span-6">
            <div class="grid grid-cols-10 overflow-y-scroll max-h-64">
                <template v-for="plugset in selectedWeapon.defaultRolls" :key="plugset">
                    <div class="grid auto-rows-max">
                        <template v-for="plug in plugset.plugSet" :key="plug.plugItemHash">
                            <nuxt-img placeholder :title="`${plug.name}`" @click="doFiltering(plug.plugItemHash)" class="bg-black h-10 w-10 m-1" :src="`https://bungie.net${plug.icon}`"/>
                        </template>
                    </div>
                    
                </template>
            </div>
            <div class="grid row-span-2 auto-rows-max">
                <p>Weapon Rolls</p>
                <template v-for="roll in selectedWeapon.filteredRolls" :key="roll">
                    <div class="grid grid-cols-1" @click="getWeapon(item.itemHash)">
                        <div class="grid grid-cols-4 m-1 bg-slate-200 hover:bg-slate-400">
                            <div class="grid-cols-1">
                                <nuxt-img class="w-10 h-10" :src="`https://bungie.net` + selectedWeapon.displayProperties.icon"/>
                            </div>
                            <div class="grid grid-cols-5 col-span-3">
                                <template v-for="perk in roll.perksData" :key="perk.plugHash">
                                    <nuxt-img class="bg-black h-10 w-10" :src="`https://bungie.net${perk.displayProperties.icon}`"/>
                                </template>
                                
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        
    </div>
</template>

<script setup lang="ts">
    const props = defineProps(["selectedWeapon"])
    const selectedWeaponRolls = ref({})

    watch(() => props.selectedWeapon, (newValue, oldValue) => {
        console.log("received new value " + newValue)
        selectedWeaponRolls.value = newValue
        console.log(selectedWeaponRolls.value)
    })

    const doFiltering = (plugHash: any) => {

    }

</script>