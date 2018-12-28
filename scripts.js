$(document).ready( function() {
    $('.status-link').click(function() {
        $('.status-link').toggle();
        $('#status').toggleClass('offensive')
        $('#status').toggleClass('defensive')
    });


    let types = {};
    $.ajax('types.json').then(function(res) {
        
        // convert to dictionary
        res.forEach(type => {
            types[type.name] = type;
        })

        buildTypeTables(res);
    });

    function buildTypeTables(arr) {
        arr.forEach(type => {
            $('#input .type-table').append(inputNamed(type.name));
            $('#status .type-table').append(boxNamed(type.name));
        });
        interfaceReady();
    }
    
    function interfaceReady() {
        calculateSuggestions();
        $('#input input').change(function() {
            types[$(this).data('type')].checked = $(this).is(':checked');
            updateUI();
            calculateSuggestions();
        });
        $('#input .type').hover(function() {
            types[$(this).data('type')].strengths.forEach(strength => {
                $(`#status .type[data-type="${strength}"]`).addClass('strong-hint');
            })
        }, function() {
            $(`#status .type`).removeClass('strong-hint');
        });
        $('#status .type').hover(function() {
            console.log('hov')
            types[$(this).data('type')].strengths.forEach(strength => {
                $(`#input .type[data-type="${strength}"]`).addClass('strong-hint');
            })
        }, function() {
            $(`#input .type`).removeClass('strong-hint');
        });
    }

    function updateUI() {
        $('#status .type').removeClass('weak');
        $('#status .type').removeClass('strong');
        $('#status .type').removeClass('immune');
        $.each(types, function(key, type) {
            if (type.checked) {
                type.weaknesses.forEach(weakness => {
                    $(`#status .type[data-type="${weakness}"]`).addClass('weak');
                });
                type.strengths.forEach(strength => {
                    $(`#status .type[data-type="${strength}"]`).addClass('strong');
                });
                type.immunes.forEach(immunity => {
                    $(`#status .type[data-type="${immunity}"]`).addClass('immune');
                });
            }
        });
    }
    
    function calculateSuggestions() {
        // determine unchecked types
        let remainingTypes = [];
        $('#status .type:not(.strong)').each(function() {
            remainingTypes.push($(this).data('type'));
        });

        let suggestions = [];
        let bestSuggestion = 0;
        // iterate through unused types
        $.each(types, function(key, type) {
            if (!type.checked) {
                // calculate how many remaining types that type is strong against
                let strongAgainst = remainingTypes.reduce((total, t) => total + (type.strengths.includes(t) ? 1 : 0), 0);

                // if strong against more than current best, replace array
                if (strongAgainst > bestSuggestion) {
                    suggestions = [type];
                    bestSuggestion = strongAgainst;
                }
                // if matching current best, append to array
                else if (strongAgainst === bestSuggestion) {
                    suggestions.push(type);
                }
            } 
        });


        $('.suggested-types').empty();
        $.each(suggestions, function(index, suggestion) {
            $('.suggested-types').append(`<span>${suggestion.name} (+${bestSuggestion})</span>`);
        });
    }
});

function inputNamed(label) {
    return `<input type="checkbox" data-type="${label}" id="input-${label}"><label class="type" for="input-${label}" data-type="${label}">${label}</label>`
}
function boxNamed(label) {
    return `<div class="type" data-type="${label}">${label}</div>`
}