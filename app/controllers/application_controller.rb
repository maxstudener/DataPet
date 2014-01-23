class ApplicationController < ActionController::Base
  protect_from_forgery

  def set_connection
    @connection = Connection.get(params[:connection_name])
  end

  def set_table
    schema_name = params[:schema_name]
    table_name = params[:table_name]

    @full_table_name = schema_name.present? ? "#{schema_name}.#{table_name}" : table_name
  end

  def snake_params(thing_to_snake)
    return thing_to_snake unless thing_to_snake.is_a?(Hash)

    snake = {}
    thing_to_snake.each do |k, v|
      snake_key = k.underscore.to_sym
      if v.is_a?(Hash)
        snake[snake_key] = snake_params(v)
      elsif v.is_a?(Array)
        snake[snake_key] = v.map{ |value| snake_params(value) }
      else
        snake[snake_key] = v
      end
    end
    snake
  end

end
