class ResponseJson
  attr_accessor :json

  def initialize
    @json = {
        success: true,
        data: {},
        error: {
            type: '',
            message: ''
        }
    }
  end

  def register_error(e)
    self.success = false
    self.error_type = e.class.name
    self.error_message = e.message
  end

  def success=(boolean_success)
    @json[:success] = boolean_success
  end

  def error_type=(string_error_type)
    @json[:error][:type] = string_error_type
  end

  def error_message=(string_error_message)
    @json[:error][:message] = string_error_message
  end

  def set(key, value)
    @json[:data][key] = value
  end

  def set_data(value)
    @json[:data] = value
  end

end