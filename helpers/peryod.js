const peryod = require('peryod');
const strings = {
    "seconds": "несколько секунд назад...",
    "minute": "минуту назад...",
    "minutes": "{value} минут назад...",
    "hour": "час назад...",
    "hours": "{value} часа назад...",
    "yesterday": "вчера, {value}",
    "past": "{date}, {time}",
    "months": [
        "Января",
        "Февраля",
        "Марта",
        "Апреля",
        "Мая",
        "Июня",
        "Июля",
        "Августа",
        "Сентября",
        "Октября",
        "Ноября",
        "Декабря"
    ]
};
exports.datesTime = function (time) {
    const someDate = new Date(time);
    return someDate.peryod(time, strings);
};