//Written by John Bender for http://erlanguid.com
//See: http://nickelcode.com/2008/11/27/github-repo-information-in-your-webpages/
//for an explanation of implementation and how to use it 
//released under the GPL v2
//http://www.gnu.org/licenses/gpl-2.0.txt
URL = "http://feeds.delicious.com/v2/json/{0}/{1}?callback={2}&count={3}";

//The following 3 templates will be used to get the json data to DisplayLinks 
//targeted at the correct user divs
TARGETED_FUNCTION_NAME = "DeliciousUserTop.Display{0}Links";
TARGETED_FUNCTION_CALL = "{0}=function(data){DeliciousUserTop.DisplayLinks(data, '{1}');}";
TARGETED_SCRIPT_TEMPLATE = "<script type='text/javascript'>{0}</script>";
//extra templates
REMOTE_SCRIPT_TEMPLATE = "<script type='text/javascript' src='{0}'></script>";
DELICIOUS_TOP_SELECTOR = ".delicious-user-top-links";
LINK_TEMPLATE =
    "<div class='delicious-user-top-link'>"
    +   "<a href='{0}' target='_blank'>"
    +  	  "{1}<img class='delicious-user-top-link-image' src='http://erlanguid.com/icons/external.png'>"
    +	  "</a>"
    +"</div>";


MAX_DISPLAY_LINKS = 10;
LINK_TEXT_MAX_LENGTH = 50;
ELIPSE = '[...]';

var DeliciousUserTop = new function(){
    this.displayObjects = new Array();
    
    //retrieve the repo information from github    
    this.GetLinks = function()
    {
        //create an array of the github data, used to prevent mutiple hits
        //to the server for the same user
        var github_usernames = new Array();

        //for all the github-projects divs 
        $(DELICIOUS_TOP_SELECTOR).each(function(i) {
            //create an array of all unique div ids as args in the page
            if(this.id != undefined)
            {
                var args = this.id;
                //add this object (div by default) that met the query parameters
                //to a list to be altered later
                if( DeliciousUserTop.displayObjects[args] == undefined)
                {
                   DeliciousUserTop.displayObjects[args] = new Array(); 
                }
                DeliciousUserTop.displayObjects[args][i] = this;
            }
        });   
        //for each unique user
        for(var i in DeliciousUserTop.displayObjects)
        {
            
            //the id field will contain the arguments delimeted by a |
            //first arg should be the username, second should be the search tag(s)
            var id_args = i.split('|');
            
            //define the name of the function with the username
            var targeted_func_name = format(TARGETED_FUNCTION_NAME, id_args[0]);
            //define the method with a username, and the call with the id from the 
            var targeted_call = format(TARGETED_FUNCTION_CALL, targeted_func_name, i);
           
            //build the function call script to insert into the dom 
            var script_element = format(TARGETED_SCRIPT_TEMPLATE, targeted_call);      
            
            //add the user specific function call to the dom
            //DeliciousUserTop.DisplayJohnDoeLinks=function(xm){ //... }
            $('body').prepend(script_element);

            //format the delicious url for our given user, search tag(s), callback function, and max number of returned links
            var remote_script_url = format(URL, id_args[0], id_args[1], targeted_func_name, MAX_DISPLAY_LINKS);

            //format the final look for the script
            script_element = format(REMOTE_SCRIPT_TEMPLATE, remote_script_url);
            //insert a script into the DOM to get the data from delicious and call our
            //user specific method added above
            $('body').prepend(script_element);
        }
    }
    //add the repo data to the div using the template
    this.DisplayLinks = function(data, id)
    {
        //if we got properly formed data
        if(data[0] != undefined)
        {
            var id_args = id.split('|');
            //for all the div objects that correspond to that user
            for(var j in DeliciousUserTop.displayObjects[id])
            {
                var div = DeliciousUserTop.displayObjects[id][j];
                //for each of the user repositories in the data
                $.each(data, function(i, obj) {
                    //add the templated information to the divs existing content
                    var link_text = obj.d.substring(0, LINK_TEXT_MAX_LENGTH);

                    if(obj.d.length > LINK_TEXT_MAX_LENGTH)
                        link_text += ELIPSE;

                    div.innerHTML = div.innerHTML + format(LINK_TEMPLATE, obj.u, link_text);
                });
                //the style div.github-projects is display: none by default
                //display it if there was no error message
                div.style.display = "block";
            }
        }
    } 
}
//used to create clean insertion of strings into templates
function format(str)
{
    for(i = 1; i < arguments.length; i++)
    {
        str = str.replace("{" + (i - 1) + "}", arguments[i]);
    }
    return str;
}
//Go Get Those REPOS!
$(document).ready(function(){DeliciousUserTop.GetLinks();});

