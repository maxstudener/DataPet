class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :init_response

  def init_response
    @response = ResponseJson.new()
  end

  rescue_from Exception do |e|
    if Rails.env == 'production'
      @response.register_error(e)
      render :json => @response.json and return
    else
      raise e
    end

  end

end