export class Callback {
    /**@type {{[id:string]:Callback}} */
    static index = {};

    /**
     *
     * @param {object} props
     * @param {string} props.id
     * @param {string} props.label
     * @param {(evt:KeyboardEvent)=>Promise<boolean>} [props.check]
     * @param {(evt:KeyboardEvent)=>Promise} props.callback
     */
    static add(props) {
        const instance = new this();
        instance.id = props.id;
        instance.label = props.label;
        instance.check = props.check ?? (async()=>true);
        instance.callback = props.callback;
        this.index[instance.id] = instance;
    }




    /**@type {string} */ id;
    /**@type {string} */ label;
    /**@type {(evt:KeyboardEvent)=>Promise<boolean>} */ check;
    /**@type {(evt:KeyboardEvent)=>Promise} */ callback;
}
