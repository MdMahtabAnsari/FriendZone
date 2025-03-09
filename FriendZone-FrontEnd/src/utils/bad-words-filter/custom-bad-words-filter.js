import {Filter} from 'bad-words';
import {hi} from 'naughty-words'

class CustomBadWordsFilter extends Filter {
    constructor() {
        super();
        this.addWords(...hi);
    }
}

export default new CustomBadWordsFilter();