class ClassMatchHandler extends MathcHandler {
    setMatch(firstPrototype, secondPrototype, handler){
        super.setMatch(firstPrototype, secondPrototype, handler)
    }
    check(firstObject, secondObject){
        const firstCandidateHandler = this.getHandler(
            firstObject.__proto__.constructor, 
            secondObject.__proto__.constructor
        )
        const secondCandidateHandler = this.getHandler(
            secondObject.__proto__.constructor, 
            firstObject.__proto__.constructor
        )
        if(firstCandidateHandler){
            firstCandidateHandler(firstObject, secondObject)
        }
        if(secondCandidateHandler){
            secondCandidateHandler(secondObject, firstObject)
        }
    }
}