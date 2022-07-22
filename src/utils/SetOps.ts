/**
 * contains functions that do all the standard set operations
 */
export abstract class SetOps {

    /**
     * returns true if a is a subset of b
     * @param a 
     * @param b 
     * @returns 
     */
    isSubset(a: Set<any>, b: Set<any>): boolean {
        a.forEach( value => {
            if(!b.has(value)) { return false; }
        })
        return true;
    }

    /**
     * returns true if a contains the same elements as b
     * @param a 
     * @param b 
     * @returns 
     */
    areEqual(a: Set<any>, b: Set<any>): boolean {
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
    intersect(a: Set<any>, b: Set<any>): Set<any> {
        return new Set([...a].filter( value => b.has(value)));
    }

    /**
     * returns union of sets a and b
     * @param a 
     * @param b 
     * @returns 
     */
    union(a: Set<any>, b: Set<any>): Set<any> {
        return new Set([...a, ...b]);
    }

    /**
     * returns a \ b
     * @param a 
     * @param b 
     * @returns 
     */
    difference(a: Set<any>, b: Set<any>): Set<any> {
        return new Set([...a].filter( value => !b.has(value)));
    }

}