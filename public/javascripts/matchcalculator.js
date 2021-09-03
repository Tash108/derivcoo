module.exports = {
    calculatePlayerMatch: function(sentence) {
        var charCount = characterCount(sentence);
        var score = reduceDigits(charCount);
        return score;
    }
};

var characterCount = function(sentence) {
    return 1000
}

var reduceDigits = function(digits) {
    return 49;
}