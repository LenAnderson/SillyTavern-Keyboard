export class Callback {
    /**@type {{[id:string]:Callback}} */
    static index = {};

    /**
     *
     * @param {object} props
     * @param {string} props.id Unique ID for the callback.
     * @param {string} props.label Label displayed in the UI.
     * @param {(evt:KeyboardEvent)=>boolean} [props.check] Function that must return true when the shortcut should be triggered, false when not. If no function is provided the shortcut will always trigger (equivalent to ()=>true). Example: "Accept message edit" should only trigger if a message is currently being edited.
     * @param {(evt:KeyboardEvent)=>Promise} props.callback Function to execute when the shortcut is triggered.
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
    /**@type {(evt:KeyboardEvent)=>boolean} */ check;
    /**@type {(evt:KeyboardEvent)=>Promise} */ callback;
}
