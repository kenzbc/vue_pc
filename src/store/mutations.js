export const MEMBER = 'member'

export const state = {
    member: {
        info: null,
        bank: {
            avatar: '/static/image/avatar.jpg',
            diamond: 0,
            guozi1: 0,
            ticket: 0,
            nickname: ''
        },
        member_id: null,
        token: null,
        dialogShow: false
    },
    scrollTop: 0,
    address:[],
    timeout: {
      compileTimeout: ''
    }
}


export const mutations = {
    setMemberItem(state, {key,val}) {
        state.member[key] = val
    },
    scrollTop (state, scrollTop) {
        state.scrollTop = scrollTop
    },
    logout(state) {
        state.member = {}
        localStorage.removeItem(MEMBER)
    },
    address(state,payload){
        state.address=payload
    }
}
