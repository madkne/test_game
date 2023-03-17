

export class GameGUI {
    protected fields: GameGUIField[] = [];
    /************************************** */
    addTextInput(id: string, placeholder?: string) {
        let input = document.createElement('input');
        input.placeholder = placeholder;

        return this._addElement(input, id);
    }
    /************************************** */
    addCheckbox(id: string, text: string, checked = false) {
        let input = document.createElement('input');
        let div = document.createElement('div');
        div.innerHTML = text;
        div.appendChild(input);
        input.type = 'checkbox';
        input.checked = checked;

        return this._addElement(div, id, 'checkbox');
    }
    /************************************** */
    addSelect(id: string, options: string[] | { value: string; text: string }[], text?: string) {
        let select = document.createElement('select');
        select.textContent = text;
        if (text) {
            let option = document.createElement('option');
            option.text = text;
            option.disabled = true;
            option.selected = true;
            select.appendChild(option);
        }
        for (const opt of options) {
            let text = '';
            let value = '';
            if (typeof opt === 'string') {
                text = value = opt;
            } else {
                text = opt.text;
                value = opt.value;
            }
            let option = document.createElement('option');
            option.value = value;
            option.innerHTML = text;
            select.appendChild(option);
        }

        return this._addElement(select, id);
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
        let isChanged = false;
        while (true) {
            isChanged = false;
            for (let i = 0; i < this.fields.length; i++) {
                if (this.fields[i]['_groupName'] === name) {
                    isChanged = true;
                    this.fields[i].remove();
                    this.fields.splice(i, 1);
                    break;
                }
            }
            if (!isChanged) break;
        }
    }
    /************************************** */
    getFieldValuesByGroup(name: string) {
        let values = {};
        for (let i = 0; i < this.fields.length; i++) {
            if (this.fields[i]['_groupName'] === name) {
                values[this.fields[i]['_id']] = this.fields[i].value();
            }
        }
        return values;
    }
    /************************************** */
    /************************************** */
    /************************************** */
    private _addElement(element: HTMLElement, id: string, tagName?: string) {
        let field = new GameGUIField(element, id, tagName);

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
    protected _tagName: string;
    constructor(element: HTMLElement, id: string, tagName?: string) {
        this._element = element;
        this._id = id;
        this._element.id = id;
        document.body.append(this._element);
        if (tagName) {
            this._tagName = tagName;
        } else {
            this._tagName = this._element.tagName.toLowerCase();
        }

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
    /************************************** */
    value<T = string>(def: T = undefined): T {
        if (this._tagName === 'input') {
            return this._element['value'] ?? def;
        }
        else if (this._tagName === 'select') {
            let selectedOption = (this._element as HTMLSelectElement).options[this._element['selectedIndex']];
            if (selectedOption.disabled) return def;
            return selectedOption.value as T;
        } else if (this._tagName === 'checkbox') {
            return this._element.children[0]['checked'] ?? Boolean(def);
        }

        return def;
    }
}