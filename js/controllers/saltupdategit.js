// Obdi - a REST interface and GUI for deploying software
// Copyright (C) 2014  Mark Clarkson
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// ------------------------------------------------------------------------
// AngularJS Controller
// ------------------------------------------------------------------------

mgrApp.controller("saltupdategitCtrl", function ($scope,$http,$modal,$log,
  $timeout,baseUrl,$rootScope) {

  $scope.environments = [];
  $scope.env = {};
  $scope.status = {};  // For env chooser button

  // Alerting
  $scope.message = "";
  $scope.mainmessage = "";
  $scope.okmessage = "";
  $scope.login.error = false;

  // Button enabling/disabling and content showing/hiding vars
  $scope.envchosen = {};
  $scope.envchosen.shown = false;
  $scope.envsetting = {};
  $scope.envsetting.shown = false;
  //$scope.envsetting.numupdated = 0;
  $scope.listbtnpressed = false;
  $scope.btnenvlistdisabled = false;
  $scope.showkeybtnblockhidden = false;
  $scope.btnshowversionsdisabled = true;
  $scope.versionlist_ready = false;
  $scope.versionlist_empty = true;
  $scope.versionlist_accept_empty = true;
  $scope.versionlist_reject_empty = true;
  $scope.versionlist_unaccepted_empty = true;
  $scope.versions = {};
  $scope.versionchanged = false;
  $scope.ver1 = 0;
  $scope.ver1up = true;
  $scope.ver1down = false;
  $scope.ver2 = 0;
  $scope.ver2up = true;
  $scope.ver2down = false;
  $scope.ver3 = 0;
  $scope.ver3up = true;
  $scope.ver3down = false;
  $scope.position = 0;
  $scope.spacing = 20;

  $rootScope.$broadcast( "searchdisabled", true );

  // ----------------------------------------------------------------------
  var clearMessages = function() {
  // ----------------------------------------------------------------------
    $scope.message = "";
    $scope.mainmessage = "";
    $scope.okmessage = "";
    $scope.login.error = false;
    $scope.error = false;
  }

  // ----------------------------------------------------------------------
  $scope.envChoice = function( envobj, $event ) {
  // ----------------------------------------------------------------------
    clearMessages();
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
    $scope.envchosen.shown = true;
    $scope.btnshowversionsdisabled = false;
    $scope.btnenvlistdisabled = true;
    $scope.env = envobj;
  };


  // ----------------------------------------------------------------------
  $scope.VerChange = function( pos, direction ) {
  // ----------------------------------------------------------------------

    $scope.position = pos;

    if( pos == 1 ) {
      if( direction == "up" ) {
        $scope.ver1++;
        $scope.oldver2 = $scope.ver2;
        $scope.ver2 = 0;
        $scope.oldver3 = $scope.ver3;
        $scope.ver3 = 0;
        $scope.ver1up = false;
        $scope.ver2up = false;
        $scope.ver3up = false;
        $scope.ver1down = true;
        $scope.ver2down = false;
        $scope.ver3down = false;
        $scope.versionchanged = true;
      } else {
        $scope.ver1--;
        $scope.ver2 = $scope.oldver2;
        $scope.ver3 = $scope.oldver3;
        $scope.ver1up = true;
        $scope.ver2up = true;
        $scope.ver3up = true;
        $scope.ver1down = false;
        $scope.ver2down = false;
        $scope.ver3down = false;
        $scope.versionchanged = false;
      }
    }
    if( pos == 2 ) {
      if( direction == "up" ) {
        $scope.ver2++;
        $scope.oldver3 = $scope.ver3;
        $scope.ver3 = 0;
        $scope.ver1up = false;
        $scope.ver2up = false;
        $scope.ver3up = false;
        $scope.ver1down = false;
        $scope.ver2down = true;
        $scope.ver3down = false;
        $scope.versionchanged = true;
      } else {
        $scope.ver2--;
        $scope.ver3 = $scope.oldver3;
        $scope.ver1up = true;
        $scope.ver2up = true;
        $scope.ver3up = true;
        $scope.ver1down = false;
        $scope.ver2down = false;
        $scope.ver3down = false;
        $scope.versionchanged = false;
      }
    }
    if( pos == 3 ) {
      if( direction == "up" ) {
        $scope.ver3++;
        $scope.ver1up = false;
        $scope.ver2up = false;
        $scope.ver3up = false;
        $scope.ver1down = false;
        $scope.ver2down = false;
        $scope.ver3down = true;
        $scope.versionchanged = true;
      } else {
        $scope.ver3--;
        $scope.ver1up = true;
        $scope.ver2up = true;
        $scope.ver3up = true;
        $scope.ver1down = false;
        $scope.ver2down = false;
        $scope.ver3down = false;
        $scope.versionchanged = false;
      }
    }
  }

  // ----------------------------------------------------------------------
  $scope.GetVersionsOutputLine = function( id ) {
  // ----------------------------------------------------------------------
  // Actually don't bother with the result, just refresh the list
  // since we know Salt has finished now.

    $scope.FillVersionListTable();
  }

  // ----------------------------------------------------------------------
  $scope.GetVersionListOutputLine = function( id ) {
  // ----------------------------------------------------------------------

    $http({
      method: 'GET',
      url: baseUrl + "/" + $scope.login.userid + "/" + $scope.login.guid
           + "/outputlines?job_id=" + id
           + '&time='+new Date().getTime().toString()
    }).success( function(data, status, headers, config) {

      try {
        $scope.versions = $.parseJSON(data[0].Text).versions;
      } catch (e) {
        clearMessages();
        $scope.message = "Error: " + e;
        $scope.message_jobid = id;
      }

      if( $scope.versions.length == 0 ) {

        $scope.versionlist_empty = true;
        $scope.versionlist_ready = true;

        $scope.ver1 = 0;
        $scope.ver2 = 0;
        $scope.ver3 = 0;

      } else {

        $scope.versionlist_ready = true;
        $scope.versionlist_empty = false;

        $scope.ver1 = $scope.versions[0].version.split(".")[0];
        $scope.ver2 = $scope.versions[0].version.split(".")[1];
        $scope.ver3 = $scope.versions[0].version.split(".")[2];

      }

      // Hide the buttons
      $scope.showkeybtnblockhidden = true;
      $scope.spacing = 0;

    }).error( function(data,status) {
      if (status>=500) {
        $scope.login.errtext = "Server error.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else if (status>=400) {
        $scope.login.errtext = "Session expired.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else if (status==0) {
        // This is a guess really
        $scope.login.errtext = "Could not connect to server.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else {
        $scope.login.errtext = "Logged out due to an unknown error.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      }
    });
  };

  // ----------------------------------------------------------------------
  $scope.VersionSuccess = function() {
  // ----------------------------------------------------------------------

    // Don't care what was in the output line, it's a success.
    $scope.okmessage = "Server configuration was updated successfully.";
    $scope.versions = [{"commit":"","desc":"","version":"Refreshing..."}];
    $scope.FillVersionListTable();
  }

  // ----------------------------------------------------------------------
  $scope.ApplyVersion = function( saltid, grain, data ) {
  // ----------------------------------------------------------------------
  // Send { Grain:"version",Text:"0.1.2" }

    $scope.versionchanged = false;

    var config = {};
    config.Branch = $scope.env.SysName;
    config.Position = "" + $scope.position;

    $http({
      method: 'POST',
      url: baseUrl + "/" + $scope.login.userid + "/" + $scope.login.guid
           + "/saltupdategit/versions"
           + "?env_id=" + $scope.env.Id
           + '&time='+new Date().getTime().toString(),
      data: config
    }).success( function(data, status, headers, config) {
      $scope.PollForJobFinish( data.JobId, 50, 0, $scope.VersionSuccess );
    }).error( function(data,status) {
      if (status>=500) {
        $scope.login.errtext = "Server error.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else if (status==401) {
        $scope.login.errtext = "Session expired.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else if (status>=400) {
        clearMessages();
        $scope.message = "Server said: " + data['Error'];
        $scope.error = true;
      } else if (status==0) {
        // This is a guess really
        $scope.login.errtext = "Could not connect to server.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else {
        $scope.login.errtext = "Logged out due to an unknown error.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      }
    });
  };

  // ----------------------------------------------------------------------
  $scope.ApplyNewVersion = function() {
  // ----------------------------------------------------------------------

    clearMessages();

    if( $scope.envsetting ) {
      $scope.ApplyVersion( $scope.envsetting.saltid );
    } else {
      //$scope.envsetting.numupdated += 1;
    }
  }

  // ----------------------------------------------------------------------
  $scope.GoBack = function( ) {
  // ----------------------------------------------------------------------
    clearMessages();
    $scope.envchosen.shown = true;
    $scope.envsetting.shown = false;
    $rootScope.$broadcast( "setsearchtext", $scope.hostfilter );
  }

  // ----------------------------------------------------------------------
  $scope.Restart = function() {
  // ----------------------------------------------------------------------
    clearMessages();
    $scope.envchosen.shown = false;
    $scope.listbtnpressed = false;
    $scope.btnenvlistdisabled = false;
    $scope.showkeybtnblockhidden = false;
    $scope.btnshowversionsdisabled = true;
    $scope.versionlist_ready = false;
    $scope.versionlist_empty = true;
    $scope.versionchanged = false;
    $scope.ver1 = 0;
    $scope.ver1up = true;
    $scope.ver1down = false;
    $scope.ver2 = 0;
    $scope.ver2up = true;
    $scope.ver2down = false;
    $scope.ver3 = 0;
    $scope.ver3up = true;
    $scope.ver3down = false;
    $scope.position = 0;
    $scope.spacing = 20;
  };

  // ----------------------------------------------------------------------
  $scope.VersionList = function() {
  // ----------------------------------------------------------------------
    $scope.btnshowversionsdisabled = true;
    $scope.listbtnpressed = true;
    $scope.versionlist_ready = false;
    $scope.versionlist_empty = false;

    $scope.FillVersionListTable();
  };

  // ----------------------------------------------------------------------
  $scope.showOutputlines = function( id ) {
  // ----------------------------------------------------------------------
  // Redirect the user to the Jobs->Outputlines plugin

    $rootScope.outputlines_plugin = {};
    $rootScope.outputlines_plugin.id = id;
    $scope.setView( "plugins/systemjobs/html/outputlines.html" );
  }

  // ----------------------------------------------------------------------
  $scope.PollForJobFinish = function( id,delay,count,func ) {
  // ----------------------------------------------------------------------
      $timeout( function() {
        $http({
          method: 'GET',
          url: baseUrl + "/" + $scope.login.userid + "/" + $scope.login.guid
               + "/jobs?job_id=" + id
               + '&time='+new Date().getTime().toString()
        }).success( function(data, status, headers, config) {
          job = data[0];
          if(job.Status == 0 || job.Status == 1 || job.Status == 4) {
            if( count > 120 ) {
              clearMessages();
              $scope.message = "Job took too long. check job ID " +
                               + id + ", then try again.";
              $scope.message_jobid = job['Id'];
            } else {
              // Then retry: capped exponential backoff
              delay = delay < 600 ? delay * 2 : 1000;
              count = count + 1;
              $scope.PollForJobFinish(id,delay,count,func);
            }
          } else if(job.Status == 5) { // Job was successfully completed
            func( id );
          } else { // Some error
            clearMessages();
            $scope.message = "Server said: " + job['StatusReason'];
            $scope.message_jobid = job['Id'];
          }
        }).error( function(data,status) {
          if (status>=500) {
            $scope.login.errtext = "Server error.";
            $scope.login.error = true;
            $scope.login.pageurl = "login.html";
          } else if (status==401) {
            $scope.login.errtext = "Session expired.";
            $scope.login.error = true;
            $scope.login.pageurl = "login.html";
          } else if (status>=400) {
            clearMessages();
            $scope.message = "Server said: " + data['Error'];
            $scope.error = true;
          } else if (status==0) {
            // This is a guess really
            $scope.login.errtext = "Could not connect to server.";
            $scope.login.error = true;
            $scope.login.pageurl = "login.html";
          } else {
            $scope.login.errtext = "Logged out due to an unknown error.";
            $scope.login.error = true;
            $scope.login.pageurl = "login.html";
          }
        });
      }, delay );
  };

  // ----------------------------------------------------------------------
  $scope.FillVersionListTable = function() {
  // ----------------------------------------------------------------------

    $http({
      method: 'GET',
      url: baseUrl + "/" + $scope.login.userid + "/" + $scope.login.guid
           + "/saltupdategit/versions?env_id=" + $scope.env.Id
           + '&time='+new Date().getTime().toString()
    }).success( function(data, status, headers, config) {
      $scope.PollForJobFinish(data.JobId,50,0,$scope.GetVersionListOutputLine);
    }).error( function(data,status) {
      if (status>=500) {
        $scope.login.errtext = "Server error.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else if (status==401) {
        $scope.login.errtext = "Session expired.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else if (status>=400) {
        clearMessages();
        $scope.message = "Server said: " + data['Error'];
        $scope.error = true;
      } else if (status==0) {
        // This is a guess really
        $scope.login.errtext = "Could not connect to server.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else {
        $scope.login.errtext = "Logged out due to an unknown error.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      }
    });
  };

  // ----------------------------------------------------------------------
  $scope.FillEnvironmentsTable = function() {
  // ----------------------------------------------------------------------

    $http({
      method: 'GET',
      url: baseUrl + "/" + $scope.login.userid + "/" + $scope.login.guid
           + "/envs?writeable=1"
           + '&time='+new Date().getTime().toString()
    }).success( function(data, status, headers, config) {
      $scope.environments = data;
      if( data.length == 0 ) {
        $scope.serverlist_empty = true;
        $scope.btnenvlistdisabled = true;
      }
    }).error( function(data,status) {
      if (status>=500) {
        $scope.login.errtext = "Server error.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else if (status==401) {
        $scope.login.errtext = "Session expired.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else if (status>=400) {
        clearMessages();
        $scope.mainmessage = "Server said: " + data['Error'];
      } else if (status==0) {
        // This is a guess really
        $scope.login.errtext = "Could not connect to server.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else {
        $scope.login.errtext = "Logged out due to an unknown error.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      }
    });
  };

  $scope.FillEnvironmentsTable();

  // ----------------------------------------------------------------------
  $scope.Delete = function( name ) {
  // ----------------------------------------------------------------------

    $http({
      method: 'DELETE',
      url: baseUrl + "/" + $scope.login.userid + "/" + $scope.login.guid
           + "/saltkeymanager/saltkeys/" + name
           + "?env_id=" + $scope.env.Id
           + '&time='+new Date().getTime().toString()
    }).success( function(data, status, headers, config) {
      $scope.PollForJobFinish(data.JobId,100,0,$scope.GetVersionsOutputLine);
    }).error( function(data,status) {
      if (status>=500) {
        $scope.login.errtext = "Server error.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else if (status==401) {
        $scope.login.errtext = "Session expired.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else if (status>=400) {
        clearMessages();
        $scope.message = "Server said: " + data['Error'];
        $scope.error = true;
      } else if (status==0) {
        // This is a guess really
        $scope.login.errtext = "Could not connect to server.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      } else {
        $scope.login.errtext = "Logged out due to an unknown error.";
        $scope.login.error = true;
        $scope.login.pageurl = "login.html";
      }
    });
  }

  // --------------------------------------------------------------------
  $scope.dialog = function (servername) {
  // --------------------------------------------------------------------

    $scope.servername = servername;

    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: $scope.ModalInstanceCtrl,
      size: 'sm',
      resolve: {
        // the servername variable is passed to the ModalInstanceCtrl
        servername: function () {
          return $scope.servername;
        }
      }
    });

    modalInstance.result.then(function (servername) {
      $log.info('Will delete: ' + $scope.servername + '(' + $scope.servername + ')' );
      $scope.Delete($scope.servername);
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  // --------------------------------------------------------------------
  $scope.ModalInstanceCtrl = function ($scope, $modalInstance, servername) {
  // --------------------------------------------------------------------

    // So the template can access 'servername' in this new scope
    $scope.servername = servername;

    $scope.ok = function () {
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };

});
