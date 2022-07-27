import { Constants } from "./Constants";

/**
 * contains functions that do all the standard set operations
 */
export class SetOps {

    static hasSpecialAction(a: Set<string>): boolean {
        let b = Array.from(a);
        if(b.some(element => Constants.isSpecialAction(element))) {
            return true;
        }
        return false;
    }

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
        let c = this.toArray(a);
        if(a.size !== b.size) {
            for(let item of c) {
                if(!b.has(item)) {
                    return false; 
                }
            }
        }
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
        let c = this.toArray(a);
        let d = this.toArray(b);
        for(let value of c) {
            if(!b.has(value)) { return false; }
        }
        for(let value of d) {
            if(!b.has(value)) { return false; }
        }
        return true;
    }

    /**
     * returns intersect of sets a and b
     * @param a 
     * @param b 
     * @returns 
     */
    static intersect(a: Set<any>, b: Set<any>): Set<any> {
        return new Set(this.toArray(a).filter( value => b.has(value)));
    }

    /**
     * returns union of sets a and b
     * @param a 
     * @param b 
     * @returns 
     */
    static union(a: Set<any>, b: Set<any>): Set<any> {
        return new Set([...this.toArray(a), ...this.toArray(b)]);
    }

    /**
     * returns a \ b
     * @param a 
     * @param b 
     * @returns 
     */
    static difference(a: Set<any>, b: Set<any>): Set<any> {
        return new Set(this.toArray(a).filter( value => !b.has(value)));
    }

    static toArray(a: Set<any>): any[] {
        let b: any[] = [];
        a.forEach( value => {
            b.push(value);
        } )
        return b;
    }

}