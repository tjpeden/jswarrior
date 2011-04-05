class Main < Sinatra::Base
  set :haml, :format => :html5
  set :public, ::File.join( ROOT, 'public' )
  
  helpers Sinatra::ContentFor2
  helpers Sinatra::StaticAssets::Helpers
  
  get '/' do
    haml :index
  end
end
