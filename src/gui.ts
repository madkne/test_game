

export class GameGUI {
    protected fields: GameGUIField[] = [];
    /************************************** */
    addInput(id: string, placeholder?: string) {
        let input = document.createElement('input');
        input.placeholder = placeholder;

        return this._addElement(input, id);
    }
    /************************************** */
    addButton(id: string, text?: string) {
        let input = document.createElement('button');
        input.textContent = text;

        return this._addElement(input, id);
    }
    /************************************** */
    findById(id: string) {
        return this.fields.find(i => i['_id'] === id);
    }
    /************************************** */
    /************************************** */
    removeElementById(id: string) {
        let index = this.fields.findIndex(i => i['_id'] === id);
        if (index > -1) {
            this.fields[index].remove();
            this.fields.splice(index, 1);
        }
    }
    /************************************** */
    removeElementsByGroup(name: string) {
        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i]['_groupName'] === name) {
                this.fields[i].remove();
                this.fields.splice(i, 1);
            }
        }
    }
    /************************************** */
    /************************************** */
    /************************************** */
    private _addElement(element: HTMLElement, id: string) {
        let field = new GameGUIField(element, id);

        this.fields.push(field);

        return field;
    }

}

/************************************** */
/************************************** */
/************************************** */
export class GameGUIField {
    protected _element: HTMLElement;
    protected _id: string;
    protected _groupName: string;
    constructor(element: HTMLElement, id: string) {
        this._element = element;
        this._id = id;
        this._element.id = id;
        document.body.append(this._element);
        return this;
    }
    /************************************** */
    remove() {
        this._element.remove();
        this._id = undefined;
        this._element = undefined;
    }
    /************************************** */
    position(options: { top?: string, left?: string, right?: string, bottom?: string } = {}, type = 'fixed') {
        this._element.style.position = type;
        if (options.top) {
            this._element.style.top = options.top;
        }
        if (options.right) {
            this._element.style.right = options.right;
        }
        if (options.left) {
            this._element.style.left = options.left;
        }
        if (options.bottom) {
            this._element.style.bottom = options.bottom;
        }
        return this;
    }
    /************************************** */
    enterKeyEvent(callback: (e: KeyboardEvent) => void) {
        this._element.addEventListener('keyup', (e) => callback(e));

        return this;
    }
    /************************************** */
    clickEvent(callback: (e: MouseEvent) => void) {
        this._element.addEventListener('click', (e) => callback(e));

        return this;
    }
    /************************************** */
    focus() {
        this._element.focus();
        return this;
    }
    /************************************** */
    element<T = HTMLElement>() {
        return this._element as T;
    }
    /************************************** */
    setGroup(name: string) {
        this._groupName = name;
        return this;
    }

}