module ApplicationHelper

  def display_messages
    html = ''
    html += display_error
    html += display_success
    html += display_notice
    html.html_safe
  end

  def display_error
    flash[:error].present? ? "<div class='row alert alert-danger'>#{ messages :error }</div>" : ''
  end

  def display_success
    flash[:success].present? ? "<div class='row alert alert-success'>#{ messages :success }</div>" : ''
  end

  def display_notice
    flash[:notice].present? ? "<div class='row alert'>#{ messages :notice }</div>" : ''
  end

  def messages(key)
    msg = ''
    if flash[key].is_a?(Array)
      flash[key].each do |message|
        msg += "#{message}<br />"
      end
      msg
    else
      flash[key]
    end
  end

  def target_blank?
    request.url.match(/(relations|connections)/) ? '' : 'target="_blank"'
  end



end
