var _data = [
  {FirstName: 'David',   LastName: 'Warren',  Age: 44, Features: {Eyes: 'brown'}, Tags: ['tag1', 'tag2', 'tag3']},
  {FirstName: 'Corrine', LastName: 'Warren',  Age: 43, Features: {Eyes: 'green'}, Tags: ['tag1', 'tag3', 'tag4']},
  {FirstName: 'Matthew', LastName: 'Warren',  Age: 20, Features: {Eyes: 'brown'}, Tags: ['tag3', 'tag5',]},
  {FirstName: 'Tim',     LastName: 'Peden',   Age: 47, Features: {Eyes: 'blue'},  Tags: ['tag5']},
  {FirstName: 'TJ',      LastName: 'Peden',   Age: 24, Features: {Eyes: 'blue'},  Tags: ['tag2', 'tag4']},
  {FirstName: 'Caleb',   LastName: 'Peden',   Age: 14, Features: {Eyes: 'brown'}, Tags: ['tag3', 'tag4', 'tag5']},
  {FirstName: 'Marsie',  LastName: 'Hagie',   Age: 66, Features: {Eyes: 'green'}, Tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']},
  {FirstName: 'Leonard', LastName: 'Hagie',   Age: 65, Features: {Eyes: 'blue'},  Tags: ['tag2', 'tag6']},
  {FirstName: 'Ashley',  LastName: 'Heffron', Age: 21, Features: {Eyes: 'green'}, Tags: ['tag1', 'tag5', 'tag6']},
  {FirstName: 'Taleah',  LastName: 'Musella', Age: 22, Features: {Eyes: 'green'}, Tags: ['tag2', 'tag3']},
  {FirstName: 'Amber',   LastName: 'Brewer',  Age: 22, Features: {Eyes: 'blue'},  Tags: ['tag6']}
];

function pluckSort(data, key) {
  return data.pluck(key).uniq().sort().map(function(n) {
    var object = {};
    object[key] = n;
    return object;
  });
}

jQuery(function($) {
  $('#data').render({
    data: _data,
    perPage: 5,
    template: $('#data-tmpl'),
    controls: $('#filter-form'),
    pageInfo: $('#page-info'),
    prevPage: $('#prev-page'),
    nextPage: $('#next-page')
  });
  
  $('#age-select-tmpl').tmpl(pluckSort(_data, 'Age')).appendTo('#age-select');
  $('#eye-select-tmpl').tmpl(pluckSort(_data.pluck('Features'), 'Eyes')).appendTo('#eye-select');
  
  $('#uploader').xhrfiles({
    allowedExtensions: ['png', 'jpg', 'jpeg', 'gif'],
    classes: {
      active: 'active'
    },
    dropzone: $('#dropzone'),
    showMessage: function(message) {
      var object = {message: message};
      $('#message-tmpl').tmpl(object).appendTo('#errors').fadeOut(15000);
    }
  });
});