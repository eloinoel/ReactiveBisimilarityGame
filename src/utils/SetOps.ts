/**
 * contains functions that do all the standard set operations
 */
export class SetOps {

    static isEmpty(a: Set<any>): boolean {
        if(a.size === 0) return true;
        return false;
    }

    /**
     * returns true if a is a subset of b
     * @param a 
     * @param b 
     * @returns 
     */
    static isSubset(a: Set<any>, b: Set<any>): boolean {
        a.forEach( value => {
            if(!b.has(value)) { return false; }
        })
        return true;
    }

    static isSubsetEq(a: Set<any>, b: Set<any>): boolean {
        if(this.isSubset(a, b) || this.areEqual(a, b)) {
            return true;
        }
        return false;
    }

    /**
     * returns true if a contains the same elements as b
     * @param a 
     * @param b 
     * @returns 
     */
    static areEqual(a: Set<any>, b: Set<any>): boolean {
        a.forEach( value => {
            if(!b.has(value)) { return false; }
        })
        b.forEach( value => {
            if(!a.has(value)) { return false; }
        })
        return true;
    }

    /**
     * returns intersect of sets a and b
     * @param a 
     * @param b 
     * @returns 
     */
    static intersect(a: Set<any>, b: Set<any>): Set<any> {
        return new Set([...a].filter( value => b.has(value)));
    }

    /**
     * returns union of sets a and b
     * @param a 
     * @param b 
     * @returns 
     */
    static union(a: Set<any>, b: Set<any>): Set<any> {
        return new Set([...a, ...b]);
    }

    /**
     * returns a \ b
     * @param a 
     * @param b 
     * @returns 
     */
    static difference(a: Set<any>, b: Set<any>): Set<any> {
        return new Set([...a].filter( value => !b.has(value)));
    }

}