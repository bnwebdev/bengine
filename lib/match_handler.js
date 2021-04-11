class MathcHandler {
    setMatch(first, second, handler){
        const candidate = this.matches.get(first)
        if(!candidate){
            this.matches.set(first, new Map([[second, handler]]))
        } else {
            candidate.set(second, handler)
        }
    }
    getHandler(first, second){
        const candidate = this.matches.get(first)
        return candidate? candidate.get(second) || null : null 
    }
    matches = new Map()
}