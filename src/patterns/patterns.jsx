//TODO: complete file setup.
    /**
     * Copies all the members of a source object to a target object.
     * <p>
     * WARNING: This includes items that aren't 'own' items!
     * </p>
     * @param {Object} target Target.
     * @param {Object} source Source.
     */
    this.mixin = function (target, source) {
        var x;
        for (x in source) {
            target[x] = source[x];
        }
    };
